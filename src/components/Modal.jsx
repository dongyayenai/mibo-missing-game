const MODAL_COPY = {
  win: {
    title: '找到咪宝啦！',
    message: '这一关完成了。',
  },
  time: {
    title: '时间到',
    message: '再找一次咪宝吧。',
  },
  settings: {
    title: '设置',
    message: '设置选项会在下一步接入。',
  },
  hint: {
    title: '提示',
    message: '提示逻辑会在下一步接入。',
  },
  shuffle: {
    title: '洗牌',
    message: '洗牌逻辑会在下一步接入。',
  },
};

export default function Modal({ type, open, onClose }) {
  if (!open || !type) {
    return null;
  }

  const copy = MODAL_COPY[type] ?? MODAL_COPY.settings;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="modal-title">{copy.title}</h2>
        <p>{copy.message}</p>
        <button className="primary-button" type="button" onClick={onClose}>
          好
        </button>
      </section>
    </div>
  );
}
