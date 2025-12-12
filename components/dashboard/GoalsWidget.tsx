import React, { useState, useEffect, useRef } from 'react';
import { Goal } from '../../types';
import { getGoals, postGoal, removeGoal, updateGoalValue } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Target, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const GoalsWidget: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<{name: string, target: string, image: string}>({ name: '', target: '', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      loadGoals();
  }, []);

  const loadGoals = async () => {
      const g = await getGoals();
      setGoals(g);
  };

  const handleCreate = async () => {
      if (!newGoal.name || !newGoal.target) return;
      const targetVal = parseFloat(newGoal.target);
      if (isNaN(targetVal) || targetVal <= 0) return;

      const goal: Goal = {
          id: uuidv4(),
          name: newGoal.name,
          targetValue: targetVal,
          currentValue: 0,
          imageUrl: newGoal.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=60', // Default Travel
          color: '#10b981'
      };
      await postGoal(goal);
      await loadGoals();
      setIsModalOpen(false);
      setNewGoal({ name: '', target: '', image: '' });
  };

  const handleDelete = async (id: string) => {
      if (window.confirm('Desistir deste sonho?')) {
          await removeGoal(id);
          await loadGoals();
      }
  };

  const handleUpdateProgress = async (goal: Goal, amount: number) => {
      const newVal = Math.max(0, goal.currentValue + amount);
      if (newVal > goal.targetValue) return; // Prevent overfill for now
      await updateGoalValue(goal.id, newVal);
      await loadGoals();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewGoal(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  if (goals.length === 0 && !isModalOpen) {
      return (
          <div 
             onClick={() => setIsModalOpen(true)}
             className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full">
                  <Target size={20} />
              </div>
              <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Álbum de Sonhos</h3>
                  <p className="text-xs text-gray-400">Transforme dinheiro em metas visuais. Clique para criar.</p>
              </div>
          </div>
      );
  }

  return (
    <>
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Target size={14} className="text-pink-500" /> Álbum de Sonhos
                </h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {goals.map(goal => {
                    const progress = (goal.currentValue / goal.targetValue) * 100;
                    const grayscale = Math.max(0, 100 - progress);

                    return (
                        <div key={goal.id} className="relative group overflow-hidden rounded-2xl bg-gray-900 aspect-[4/3] shadow-md border border-gray-200 dark:border-gray-800">
                             {/* Background Image with Dynamic Grayscale */}
                             <div 
                                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                                style={{ 
                                    backgroundImage: `url(${goal.imageUrl})`,
                                    filter: `grayscale(${grayscale}%) brightness(${0.6 + (progress/250)})` 
                                }}
                             />
                             
                             {/* Content Overlay */}
                             <div className="absolute inset-0 p-3 flex flex-col justify-between">
                                 <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                        {Math.round(progress)}%
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(goal.id)}
                                        className="text-white/50 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                 </div>

                                 <div>
                                     <p className="text-white font-bold text-sm shadow-black drop-shadow-md truncate">{goal.name}</p>
                                     <p className="text-white/80 text-xs text-shadow">
                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(goal.currentValue)} 
                                         / 
                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(goal.targetValue)}
                                     </p>
                                 </div>
                             </div>

                             {/* Interactive Progress Adder */}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                 <button 
                                    onClick={() => handleUpdateProgress(goal, 50)}
                                    className="bg-white/20 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors backdrop-blur-md border border-white/30"
                                    title="Adicionar R$ 50"
                                 >
                                     <Plus size={16} /> <span className="text-xs font-bold">50</span>
                                 </button>
                                 <button 
                                    onClick={() => handleUpdateProgress(goal, 100)}
                                    className="bg-white/20 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors backdrop-blur-md border border-white/30"
                                    title="Adicionar R$ 100"
                                 >
                                     <Plus size={16} /> <span className="text-xs font-bold">100</span>
                                 </button>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Sonho">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Qual seu objetivo?</label>
                    <input 
                        type="text" 
                        value={newGoal.name}
                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        placeholder="Ex: Viagem para Disney, PS5..."
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quanto custa?</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                        <input 
                            type="number" 
                            value={newGoal.target}
                            onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                            placeholder="0,00"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Foto de Inspiração</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors bg-cover bg-center relative"
                        style={{ backgroundImage: newGoal.image ? `url(${newGoal.image})` : 'none' }}
                    >
                        {!newGoal.image && (
                            <>
                                <ImageIcon className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Clique para escolher imagem</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} className="w-full">Criar Meta</Button>
            </div>
        </Modal>
    </>
  );
};