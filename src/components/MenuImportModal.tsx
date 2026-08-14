'use client';

import { useState, useRef } from 'react';
import { parseMenuFileAction } from '@/lib/actions';
import { ALLERGENS, MenuCollection, MenuCategory, MenuItem, EMPTY_TRANSLATABLE, generateId } from '@/lib/types';
import { ExtractedCollection, ExtractedProduct } from '@/lib/validations/import';
import { SparkIcon, CheckIcon } from './Icons';

interface MenuImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (collections: MenuCollection[]) => void;
}

export default function MenuImportModal({ isOpen, onClose, onImport }: MenuImportModalProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedCollections, setExtractedCollections] = useState<ExtractedCollection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Formato no soportado. Por favor sube un archivo PDF o una imagen (PNG, JPG, WebP).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo supera los 10 MB máximos permitidos.');
      return;
    }
    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStep('analyzing');
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultString = reader.result as string;
          const base64 = resultString.split(',')[1];
          const result = await parseMenuFileAction({ base64, mimeType: file.type });

          if (!result.success || !result.data) {
            setError(result.error || 'No se pudo analizar el archivo. Intenta con una imagen o PDF más claro.');
            setStep('upload');
            return;
          }

          setExtractedCollections(result.data.collections || []);
          setStep('review');
        } catch (err: unknown) {
          console.error('Error al invocar Server Action de IA:', err);
          setError('Ocurrió un error al procesar el archivo. Revisa que el archivo no supere los 10 MB e inténtalo de nuevo.');
          setStep('upload');
        }
      };
      reader.onerror = () => {
        setError('No se pudo leer el archivo local.');
        setStep('upload');
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      console.error('Error en handleAnalyze:', err);
      setError('Error al procesar el archivo.');
      setStep('upload');
    }
  };

  // Handlers for Collection / Category / Product editing
  const handleUpdateCollectionName = (colIndex: number, field: 'name_es' | 'name_en', value: string) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => (i === colIndex ? { ...col, [field]: value } : col))
    );
  };

  const handleToggleFixedPrice = (colIndex: number) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => (i === colIndex ? { ...col, hasFixedPrice: !col.hasFixedPrice } : col))
    );
  };

  const handleUpdateFixedPrice = (colIndex: number, value: string) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => (i === colIndex ? { ...col, fixedPrice: value } : col))
    );
  };

  const handleAddCategory = (colIndex: number) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) =>
        i === colIndex
          ? {
              ...col,
              categories: [...col.categories, { name_es: 'Nueva Categoría', name_en: '', products: [] }],
            }
          : col
      )
    );
  };

  const handleRemoveCategory = (colIndex: number, catIndex: number) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) =>
        i === colIndex
          ? { ...col, categories: col.categories.filter((_, cIdx) => cIdx !== catIndex) }
          : col
      )
    );
  };

  const handleUpdateCategoryName = (
    colIndex: number,
    catIndex: number,
    field: 'name_es' | 'name_en',
    value: string
  ) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => {
        if (i !== colIndex) return col;
        const newCats = col.categories.map((cat, cIdx) =>
          cIdx === catIndex ? { ...cat, [field]: value } : cat
        );
        return { ...col, categories: newCats };
      })
    );
  };

  const handleUpdateProduct = (
    colIndex: number,
    catIndex: number,
    prodIndex: number,
    field: keyof ExtractedProduct,
    value: string | string[]
  ) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => {
        if (i !== colIndex) return col;
        const newCats = col.categories.map((cat, cIdx) => {
          if (cIdx !== catIndex) return cat;
          const newProds = cat.products.map((prod, pIdx) =>
            pIdx === prodIndex ? { ...prod, [field]: value } : prod
          );
          return { ...cat, products: newProds };
        });
        return { ...col, categories: newCats };
      })
    );
  };

  const handleToggleProductAllergen = (
    colIndex: number,
    catIndex: number,
    prodIndex: number,
    allergenId: string
  ) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => {
        if (i !== colIndex) return col;
        const newCats = col.categories.map((cat, cIdx) => {
          if (cIdx !== catIndex) return cat;
          const newProds = cat.products.map((prod, pIdx) => {
            if (pIdx !== prodIndex) return prod;
            const currentAllergens = prod.allergens || [];
            const exists = currentAllergens.includes(allergenId);
            const updated = exists
              ? currentAllergens.filter((id) => id !== allergenId)
              : [...currentAllergens, allergenId];
            return { ...prod, allergens: updated };
          });
          return { ...cat, products: newProds };
        });
        return { ...col, categories: newCats };
      })
    );
  };

  const handleRemoveProduct = (colIndex: number, catIndex: number, prodIndex: number) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => {
        if (i !== colIndex) return col;
        const newCats = col.categories.map((cat, cIdx) => {
          if (cIdx !== catIndex) return cat;
          return { ...cat, products: cat.products.filter((_, pIdx) => pIdx !== prodIndex) };
        });
        return { ...col, categories: newCats };
      })
    );
  };

  const handleAddProduct = (colIndex: number, catIndex: number) => {
    setExtractedCollections((prev) =>
      prev.map((col, i) => {
        if (i !== colIndex) return col;
        const newCats = col.categories.map((cat, cIdx) => {
          if (cIdx !== catIndex) return cat;
          return {
            ...cat,
            products: [
              ...cat.products,
              { name_es: 'Nuevo Plato', name_en: '', description_es: '', description_en: '', price: '0.00', allergens: [] },
            ],
          };
        });
        return { ...col, categories: newCats };
      })
    );
  };

  const handleConfirmImport = () => {
    const convertedCollections: MenuCollection[] = extractedCollections.map((col) => ({
      id: generateId(),
      name: { ...EMPTY_TRANSLATABLE, es: col.name_es, en: col.name_en || '' },
      available: true,
      hasFixedPrice: col.hasFixedPrice,
      fixedPrice: col.fixedPrice,
      categories: col.categories.map((cat): MenuCategory => ({
        id: generateId(),
        name: { ...EMPTY_TRANSLATABLE, es: cat.name_es, en: cat.name_en || '' },
        available: true,
        items: cat.products.map((prod): MenuItem => ({
          id: generateId(),
          name: { ...EMPTY_TRANSLATABLE, es: prod.name_es, en: prod.name_en || '' },
          description: { ...EMPTY_TRANSLATABLE, es: prod.description_es || '', en: prod.description_en || '' },
          price: String(prod.price || '0.00'),
          allergens: prod.allergens || [],
          available: true,
        })),
      })),
    }));

    onImport(convertedCollections);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setError(null);
    setExtractedCollections([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="card max-h-[90vh] w-full max-w-4xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--kitcho-orange)] text-white shadow-sm">
              <SparkIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                Importador Inteligente de Menús (IA)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">
                Lector bilingüe (ES / EN) de PDFs y fotos con separación inteligente de cartas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-sm font-medium text-red-700 dark:text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: UPLOAD DROPZONE */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-[var(--kitcho-orange)] bg-orange-50/50 dark:bg-slate-800'
                    : 'border-slate-300 dark:border-slate-700 hover:border-[var(--kitcho-orange)] dark:hover:border-orange-500 bg-slate-50/50 dark:bg-slate-950/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <span className="text-4xl mb-3">📄</span>
                <p className="text-sm font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                  Arrastra aquí tu carta o haz clic para seleccionar
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)] dark:text-slate-400">
                  Formatos soportados: PDF, PNG, JPG, WebP (máximo 10 MB)
                </p>

                {file && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 px-3 py-1.5 text-xs font-bold text-[var(--kitcho-orange-dark)] dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    <span>✓ Archivo seleccionado:</span>
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span className="text-gray-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="btn btn-primary btn-lg disabled:opacity-50"
                >
                  ✨ Analizar Carta con IA
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING STATE */}
          {step === 'analyzing' && (
            <div className="py-16 text-center space-y-4">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--kitcho-orange)] text-white shadow-md animate-pulse">
                <SparkIcon className="h-8 w-8" />
              </span>
              <h3 className="text-xl font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                Analizando tu carta con IA Multimodal…
              </h3>
              <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400 max-w-md mx-auto">
                Filtrando español e inglés, detectando menús degustación, precios y los 14 alérgenos de la UE. Esto tomará solo unos segundos.
              </p>
            </div>
          )}

          {/* STEP 3: INTERACTIVE REVISION FORM */}
          {step === 'review' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                    Revisa los datos detectados ({extractedCollections.length} cartas extraídas)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">
                    Se han separado automáticamente los textos en Español e Inglés y detectado precios y alérgenos.
                  </p>
                </div>
              </div>

              {extractedCollections.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  No se detectaron datos en el documento.
                </div>
              ) : (
                <div className="space-y-10">
                  {extractedCollections.map((col, colIndex) => (
                    <div
                      key={colIndex}
                      className="rounded-2xl border-2 border-orange-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-5"
                    >
                      {/* Collection Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-[var(--kitcho-orange)]">Nombre del Menú:</span>
                            <input
                              type="text"
                              value={col.name_es}
                              onChange={(e) => handleUpdateCollectionName(colIndex, 'name_es', e.target.value)}
                              className="input !min-h-9 !py-1 text-base font-bold w-64 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                              placeholder="Nombre en español"
                            />
                            <input
                              type="text"
                              value={col.name_en}
                              onChange={(e) => handleUpdateCollectionName(colIndex, 'name_en', e.target.value)}
                              className="input !min-h-9 !py-1 text-sm w-48 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                              placeholder="Name in English"
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={col.hasFixedPrice}
                                onChange={() => handleToggleFixedPrice(colIndex)}
                                className="rounded"
                              />
                              <span>Menú de Precio Fijo Global (ej. Menú Degustación)</span>
                            </label>
                            {col.hasFixedPrice && (
                              <input
                                type="text"
                                value={col.fixedPrice}
                                onChange={(e) => handleUpdateFixedPrice(colIndex, e.target.value)}
                                className="input !min-h-8 !py-1 text-xs font-bold w-24 text-center dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                                placeholder="28.00 €"
                              />
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCategory(colIndex)}
                          className="btn btn-outline btn-sm dark:!border-slate-700 dark:!text-white shrink-0"
                        >
                          + Añadir categoría a esta carta
                        </button>
                      </div>

                      {/* Categories List */}
                      <div className="space-y-6">
                        {col.categories.map((category, catIndex) => (
                          <div
                            key={catIndex}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between gap-3 border-b pb-2 dark:border-slate-800">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs font-bold text-gray-500">Categoría:</span>
                                <input
                                  type="text"
                                  value={category.name_es}
                                  onChange={(e) =>
                                    handleUpdateCategoryName(colIndex, catIndex, 'name_es', e.target.value)
                                  }
                                  className="input !min-h-8 !py-1 text-sm font-bold w-48 dark:!bg-slate-950 dark:!border-slate-700 dark:!text-white"
                                  placeholder="Categoría (ES)"
                                />
                                <input
                                  type="text"
                                  value={category.name_en}
                                  onChange={(e) =>
                                    handleUpdateCategoryName(colIndex, catIndex, 'name_en', e.target.value)
                                  }
                                  className="input !min-h-8 !py-1 text-xs w-40 dark:!bg-slate-950 dark:!border-slate-700 dark:!text-white"
                                  placeholder="Category (EN)"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(colIndex, catIndex)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                Eliminar ✕
                              </button>
                            </div>

                            {/* Products List */}
                            <div className="space-y-3">
                              {category.products.map((product, prodIndex) => (
                                <div
                                  key={prodIndex}
                                  className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3 space-y-2"
                                >
                                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_6rem_2rem]">
                                    <input
                                      type="text"
                                      value={product.name_es}
                                      onChange={(e) =>
                                        handleUpdateProduct(colIndex, catIndex, prodIndex, 'name_es', e.target.value)
                                      }
                                      className="input !min-h-8 !py-1 text-xs font-bold dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                                      placeholder="Nombre del plato (ES)"
                                    />
                                    <input
                                      type="text"
                                      value={product.name_en}
                                      onChange={(e) =>
                                        handleUpdateProduct(colIndex, catIndex, prodIndex, 'name_en', e.target.value)
                                      }
                                      className="input !min-h-8 !py-1 text-xs dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                                      placeholder="Dish name (EN)"
                                    />
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={product.price}
                                        onChange={(e) =>
                                          handleUpdateProduct(colIndex, catIndex, prodIndex, 'price', e.target.value)
                                        }
                                        className="input !min-h-8 !py-1 text-right text-xs font-bold pr-5 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                                        placeholder="0.00"
                                      />
                                      <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-gray-500">€</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(colIndex, catIndex, prodIndex)}
                                      className="text-gray-400 hover:text-red-500 font-bold text-xs"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <input
                                      type="text"
                                      value={product.description_es}
                                      onChange={(e) =>
                                        handleUpdateProduct(colIndex, catIndex, prodIndex, 'description_es', e.target.value)
                                      }
                                      className="input !min-h-7 !py-1 text-[11px] text-gray-600 dark:text-slate-300 dark:!bg-slate-900 dark:!border-slate-700"
                                      placeholder="Descripción (ES)"
                                    />
                                    <input
                                      type="text"
                                      value={product.description_en}
                                      onChange={(e) =>
                                        handleUpdateProduct(colIndex, catIndex, prodIndex, 'description_en', e.target.value)
                                      }
                                      className="input !min-h-7 !py-1 text-[11px] text-gray-600 dark:text-slate-300 dark:!bg-slate-900 dark:!border-slate-700"
                                      placeholder="Description (EN)"
                                    />
                                  </div>

                                  {/* Allergen Badges Selector */}
                                  <div className="pt-1">
                                    <div className="flex flex-wrap gap-1">
                                      {ALLERGENS.map((allergen) => {
                                        const isSelected = (product.allergens || []).includes(allergen.id);
                                        return (
                                          <button
                                            key={allergen.id}
                                            type="button"
                                            onClick={() =>
                                              handleToggleProductAllergen(colIndex, catIndex, prodIndex, allergen.id)
                                            }
                                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                                              isSelected
                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-transparent'
                                            }`}
                                          >
                                            <span>{allergen.icon}</span>
                                            <span>{allergen.name}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => handleAddProduct(colIndex, catIndex)}
                                className="btn btn-ghost btn-sm text-xs text-[var(--kitcho-orange-dark)] dark:text-orange-400"
                              >
                                + Añadir plato a {category.name_es}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[var(--border)] dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-ghost text-xs text-gray-500"
                >
                  ← Volver a subir otro archivo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="btn btn-primary btn-lg"
                >
                  <CheckIcon className="h-4 w-4" /> Confirmar e Importar {extractedCollections.length} Cartas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
