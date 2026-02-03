'use client';

import { CONTACT_TYPES, ContactFormData } from '@/lib/emailjs';

interface ContactFormFieldsProps {
  formData: ContactFormData;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function ContactFormFields({
  formData,
  validationErrors,
  onInputChange,
}: ContactFormFieldsProps) {
  return (
    <>
      {/* お名前 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          お名前
          <span className="text-gray-400 text-xs ml-2">（任意）</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="山田 太郎"
        />
      </div>

      {/* メールアドレス */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          メールアドレス
          <span className="text-red-500 text-xs ml-2">（必須）</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            validationErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
        />
        {validationErrors.email && (
          <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      {/* お問い合わせ種別 */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          お問い合わせ種別
          <span className="text-red-500 text-xs ml-2">（必須）</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
        >
          {CONTACT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* お問い合わせ内容 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          お問い合わせ内容
          <span className="text-red-500 text-xs ml-2">（必須）</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={onInputChange}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
            validationErrors.message ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="お問い合わせ内容をご記入ください"
        />
        {validationErrors.message && (
          <p className="mt-2 text-sm text-red-600">{validationErrors.message}</p>
        )}
      </div>
    </>
  );
}
