(function () {
  document.documentElement.setAttribute('lang', 'en-GB');

  if (document.getElementById('until-modal')) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'until-modal';
  dialog.className = 'modal';
  dialog.innerHTML = `
    <div class="modal-box max-w-sm">
      <h3 id="until-modal-title" class="font-bold text-base mb-1">Snooze until</h3>
      <p class="text-xs opacity-60 mb-4">Pick the date and time this should automatically become available again.</p>
      <input id="until-modal-input" type="datetime-local" class="input input-bordered w-full" />
      <div class="flex justify-end gap-2 mt-4">
        <button id="until-modal-cancel" class="btn btn-sm btn-ghost">Cancel</button>
        <button id="until-modal-ok" class="btn btn-sm btn-primary">Confirm</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  `;
  document.body.appendChild(dialog);

  function toLocalInputValue(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  window.pickUntilDatetime = function (title) {
    const titleEl = document.getElementById('until-modal-title');
    const input = document.getElementById('until-modal-input');
    const okBtn = document.getElementById('until-modal-ok');
    const cancelBtn = document.getElementById('until-modal-cancel');

    titleEl.textContent = title || 'Snooze until';

    const min = new Date(Date.now() + 60 * 1000);
    input.min = toLocalInputValue(min);
    input.value = toLocalInputValue(min);

    return new Promise(resolve => {
      const cleanup = () => {
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        dialog.removeEventListener('cancel', onCancel);
      };
      const onOk = () => {
        if (!input.value) return;
        const iso = new Date(input.value).toISOString();
        cleanup();
        dialog.close();
        resolve(iso);
      };
      const onCancel = () => {
        cleanup();
        resolve(null);
      };

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      dialog.addEventListener('cancel', onCancel);
      dialog.showModal();
    });
  };
})();
