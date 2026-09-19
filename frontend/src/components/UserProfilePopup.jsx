import React from 'react';
import verifiedBadge from '../assets/verified.png';

const socialOrder = ['twitter', 'github', 'linkedin', 'website', 'instagram'];

const formatHandle = (value = '') => {
  if (!value) return '';
  return value.startsWith('http://') || value.startsWith('https://') ? value : value.replace(/^@/, '');
};

const fallbackUsername = (author) => {
  if (author?.username) return author.username;
  return String(author?.name || 'user').toLowerCase().replace(/\s+/g, '_');
};

export default function UserProfilePopup({ author, onClose }) {
  if (!author) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#101018] border border-white/[0.08] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/[0.05] border border-white/[0.1]">
            {author.profilePicture ? (
              <img src={author.profilePicture} alt={author.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/50">
                {(author.name?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <p className="text-white/90 font-semibold text-lg">{author.name || 'Anonymous'}</p>
            <p className="text-indigo-300 text-sm flex items-center gap-1.5">
              @{fallbackUsername(author)}
              {author.role === 'admin' && (
                <img
                  src={verifiedBadge}
                  alt="Admin verified"
                  title="blogifyadmin - this account is affiliated with blogify"
                  className="w-4 h-4 object-contain"
                />
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Bio</p>
            <p className="text-white/70 text-sm leading-relaxed">
              {author.bio || 'No bio added yet.'}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">Social</p>
            <div className="flex flex-wrap gap-2">
              {socialOrder.map((key) => {
                const value = author.socialHandles?.[key];
                if (!value) return null;
                const display = formatHandle(value);
                const isLink = value.startsWith('http://') || value.startsWith('https://');
                return isLink ? (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/70 text-xs hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                  >
                    {key}: {display}
                  </a>
                ) : (
                  <span
                    key={key}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/70 text-xs"
                  >
                    {key}: @{display}
                  </span>
                );
              })}
              {!socialOrder.some((key) => author.socialHandles?.[key]) && (
                <p className="text-white/40 text-xs">No social handles added.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
