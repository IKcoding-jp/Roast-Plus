import React, { useState } from 'react';
import { HiSave } from 'react-icons/hi';

type Props = {
    onSave: (name: string) => void;
    disabled: boolean;
};

export const RecordForm = ({ onSave, disabled }: Props) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-[1.5dvh] pt-[2dvh] border-t border-gray-100">
            <div>
                <label htmlFor="recordName" className="block text-[1.5dvh] font-bold text-gray-400 mb-[0.5dvh]">
                    記録名 (任意)
                </label>
                <input
                    id="recordName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="A"
                    className="w-full px-3 h-[6dvh] min-h-[40px] rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#EF8A00] focus:ring-2 focus:ring-[#EF8A00]/20 outline-none transition-all text-[2dvh] text-gray-800 placeholder-gray-400 font-medium"
                />
            </div>
            <button
                type="submit"
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 bg-[#EF8A00] text-white h-[6.5dvh] min-h-[44px] rounded-xl font-bold shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[2dvh]"
            >
                <HiSave className="w-[2.5dvh] h-[2.5dvh]" />
                記録してリセット
            </button>
        </form>
    );
};
