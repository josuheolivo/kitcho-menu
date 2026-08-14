'use client';

import { useState, useRef } from 'react';
import { parseMenuFileAction } from '@/lib/actions';
import { ALLERGENS, MenuCategory, MenuItem, EMPTY_TRANSLATABLE, generateId } from '@/lib/types';
import { ExtractedCategory, ExtractedProduct } from '@/lib/validations/import';
import { SparkIcon, CheckIcon } from './Icons';

interface MenuImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (categories: MenuCategory[]) => void;
}

export default function MenuImportModal({ isOpen, onClose, onImport }: MenuImportModalProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedCategories, setExtractedCategories] = useState<ExtractedCategory[]>([]);
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

    const formData = new FormData();
    formData.append('file', file);

    const result = await parseMenuFileAction(formData);

    if (!result.success || !result.data) {
      setError(result.error || 'No se pudo analizar el archivo. Intenta con una imagen o PDF más claro.');
      setStep('upload');
      return;
    }

    setExtractedCategories(result.data.categories || []);
    setStep('review');
  };

  // Review & Edit Handlers
  const handleUpdateCategoryName = (catIndex: number, newName: string) => {
    setExtractedCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, name: newName } : cat))
    );
  };

  const handleRemoveCategory = (catIndex: number) => {
    setExtractedCategories((prev) => prev.filter((_, i) => i !== catIndex));
  };

  const handleAddCategory = () => {
    setExtractedCategories((prev) => [
      ...prev,
      { name: 'Nueva Categoría', products: [] },
    ]);
  };

  const handleUpdateProduct = (
    catIndex: number,
    prodIndex: number,
    field: keyof ExtractedProduct,
    value: string | string[]
  ) => {
    setExtractedCategories((prev) =>
      prev.map((cat, cIdx) => {
        if (cIdx !== catIndex) return cat;
        const newProducts = cat.products.map((prod, pIdx) => {
          if (pIdx !== prodIndex) return prod;
          return { ...prod, [field]: value };
        });
        return { ...cat, products: newProducts };
      })
    );
  };

  const handleToggleProductAllergen = (catIndex: number, prodIndex: number, allergenId: string) => {
    setExtractedCategories((prev) =>
      prev.map((cat, cIdx) => {
        if (cIdx !== catIndex) return cat;
        const newProducts = cat.products.map((prod, pIdx) => {
          if (pIdx !== prodIndex) return prod;
          const currentAllergens = prod.allergens || [];
          const exists = currentAllergens.includes(allergenId);
          const updated = exists
            ? currentAllergens.filter((id) => id !== allergenId)
            : [...currentAllergens, allergenId];
          return { ...prod, allergens: updated };
        });
        return { ...cat, products: newProducts };
      })
    );
  };

  const handleRemoveProduct = (catIndex: number, prodIndex: number) => {
    setExtractedCategories((prev) =>
      prev.map((cat, cIdx) => {
        if (cIdx !== catIndex) return cat;
        return { ...cat, products: cat.products.filter((_, pIdx) => pIdx !== prodIndex) };
      })
    );
  };

  const handleAddProduct = (catIndex: number) => {
    setExtractedCategories((prev) =>
      prev.map((cat, cIdx) => {
        if (cIdx !== catIndex) return cat;
        return {
          ...cat,
          products: [
            ...cat.products,
            { name: 'Nuevo Plato', description: '', price: '0.00', allergens: [] },
          ],
        };
      })
    );
  };

  const handleConfirmImport = () => {
    const convertedCategories: MenuCategory[] = extractedCategories.map((cat) => ({
      id: generateId(),
      name: { ...EMPTY_TRANSLATABLE, es: cat.name },
      available: true,
      items: cat.products.map((prod): MenuItem => ({
        id: generateId(),
        name: { ...EMPTY_TRANSLATABLE, es: prod.name },
        description: { ...EMPTY_TRANSLATABLE, es: prod.description || '' },
        price: String(prod.price || '0.00'),
        allergens: prod.allergens || [],
        available: true,
      })),
    }));

    onImport(convertedCategories);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setError(null);
    setExtractedCategories([]);
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
                Sube tu carta en PDF o foto para extraer automáticamente platos, precios y alérgenos.
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
                Estamos identificando categorías, platos, precios y los 14 alérgenos de la UE. Esto tomará solo unos segundos.
              </p>
            </div>
          )}

          {/* STEP 3: INTERACTIVE REVISION TABLE / FORM */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--kitcho-charcoal)] dark:text-white">
                    Revisa los datos detectados ({extractedCategories.reduce((acc, c) => acc + c.products.length, 0)} platos en {extractedCategories.length} categorías)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400">
                    Puedes corregir cualquier texto, precio o etiqueta de alérgeno antes de importar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="btn btn-outline btn-sm dark:!border-slate-700 dark:!text-white"
                >
                  + Nueva categoría
                </button>
              </div>

              {extractedCategories.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  No se detectaron categorías en la carta. Haz clic en "+ Nueva categoría" para agregar manualmente.
                </div>
              ) : (
                <div className="space-y-8">
                  {extractedCategories.map((category, catIndex) => (
                    <div
                      key={catIndex}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-4"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold uppercase text-[var(--kitcho-orange)]">Categoría:</span>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleUpdateCategoryName(catIndex, e.target.value)}
                            className="input !min-h-9 !py-1 text-base font-bold w-64 dark:!bg-slate-900 dark:!border-slate-700 dark:!text-white"
                            placeholder="Nombre de la categoría"
                          />
                          <span className="badge bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {category.products.length} platos
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(catIndex)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                          title="Eliminar esta categoría"
                        >
                          Eliminar categoría ✕
                        </button>
                      </div>

                      {/* Products List */}
                      <div className="space-y-3">
                        {category.products.map((product, prodIndex) => (
                          <div
                            key={prodIndex}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3 shadow-sm"
                          >
                            <div className="grid gap-3 sm:grid-cols-[1fr_7rem_2.5rem]">
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) =>
                                  handleUpdateProduct(catIndex, prodIndex, 'name', e.target.value)
                                }
                                className="input !min-h-9 !py-1 text-sm font-bold dark:!bg-slate-950 dark:!border-slate-700 dark:!text-white"
                                placeholder="Nombre del plato"
                              />
                              <div className="relative">
                                <input
                                  type="text"
                                  value={product.price}
                                  onChange={(e) =>
                                    handleUpdateProduct(catIndex, prodIndex, 'price', e.target.value)
                                  }
                                  className="input !min-h-9 !py-1 text-right text-sm font-bold pr-6 dark:!bg-slate-950 dark:!border-slate-700 dark:!text-white"
                                  placeholder="0.00"
                                />
                                <span className="absolute right-2 top-2 text-xs font-bold text-gray-500">€</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(catIndex, prodIndex)}
                                className="text-gray-400 hover:text-red-500 font-bold"
                                title="Eliminar plato"
                              >
                                ✕
                              </button>
                            </div>

                            <input
                              type="text"
                              value={product.description}
                              onChange={(e) =>
                                handleUpdateProduct(catIndex, prodIndex, 'description', e.target.value)
                              }
                              className="input !min-h-8 !py-1 text-xs text-gray-600 dark:text-slate-300 dark:!bg-slate-950 dark:!border-slate-700"
                              placeholder="Descripción o ingredientes (opcional)"
                            />

                            {/* Allergen Badges Selector */}
                            <div className="pt-1">
                              <span className="text-[11px] font-bold text-gray-400 block mb-1">Alérgenos detectados:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {ALLERGENS.map((allergen) => {
                                  const isSelected = (product.allergens || []).includes(allergen.id);
                                  return (
                                    <button
                                      key={allergen.id}
                                      type="button"
                                      onClick={() =>
                                        handleToggleProductAllergen(catIndex, prodIndex, allergen.id)
                                      }
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
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
                          onClick={() => handleAddProduct(catIndex)}
                          className="btn btn-ghost btn-sm text-xs text-[var(--kitcho-orange-dark)] dark:text-orange-400"
                        >
                          + Añadir plato a {category.name}
                        </button>
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
                  <CheckIcon className="h-4 w-4" /> Confirmar e Importar a mi Carta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
