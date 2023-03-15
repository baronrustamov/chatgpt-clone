import React from 'react';

export default function Footer() {
  return (
    <div className="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
      <a
        href="https://github.com/spv420/chatgpt-clone"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        ChatLLaMA
      </a>
      &nbsp;&mdash; a ChatGPT-like digital assistant based on the LLaMA text-generation AI from Meta.
      <br/>
      Credit to <i>danny-avila</i> for the UI,&nbsp;
      <a
        href="https://github.com/danny-avila/chatgpt-clone"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        ChatGPT Clone
      </a>
      . 
    </div>
  );
}
