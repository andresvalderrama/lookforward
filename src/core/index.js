import { fetch, append, remove, getUniqId, addClass } from '../lib/util.js';

const assign = require('es6-object-assign').assign;

const defaults = {
  classNames: {
    LookForward: 'lookforward',
    LookForwardBody: 'lookforward-body',
    LookForwardInner: 'lookforward-inner',
    LookForwardClose: 'lookforward-close',
    LookForwardCloseBtn: 'lookforward-close-btn',
    LookForwardHeader: 'lookforward-header',
    LookForwardFooter: 'lookforward-footer'
  },
  scrapedArea: '.js-lookforward-target',
  useHistoryApi: true
}

export default class LookForward {

  constructor(selector, options = {}) {
    this.options = assign({}, defaults, options);
    this.id = getUniqId();
    const eles = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    this.currentUrl = location.href;
    if (!eles) {
      return;
    }
    [].forEach.call(eles, (ele) => {
      this.addClickEvent(ele);
    });
  }

  addClickEvent (ele) {
    const id = this.id;
    ele.addEventListener('click', (event) => {
      event.preventDefault();
      const href = ele.getAttribute('href');
      fetch(href).then((doc) => {
        const html = doc.querySelector(this.options.scrapedArea);
        if (!html) {
          return;
        }
        const build = this.buildHtml(html.innerHTML, id);
        const body = document.querySelector('body');
        body.style.overflow = 'hidden';
        append(body, build);
        const closeBtn = document.querySelector(`#${id} .js-lookforward-close-btn`);
        closeBtn.addEventListener('click', () => {
          this.removeModal();
        });
        if (window.history && this.options.useHistoryApi) {
          window.history.replaceState({}, "" , href);
        }
      })
    });
  }

  removeModal() {
    const classNames = this.options.classNames;
    const modal = document.querySelector(`#${this.id}`);
    const body = document.querySelector('body');
    addClass(modal, classNames.LookForwardClose);
    setTimeout(() => {
      remove(modal);
      body.style.overflow = '';
      if (window.history && this.options.useHistoryApi) {
        window.history.replaceState({}, "" , this.currentUrl);
      }
    }, 300);
  }

  buildHtml(html, id) {
    const classNames = this.options.classNames;
    return (`
      <div class="${classNames.LookForward}" id="${id}">
        <div class="${classNames.LookForwardBody}">
          <div class="${classNames.LookForwardHeader}">
            <button class="${classNames.LookForwardCloseBtn} js-lookforward-close-btn"></button>
          </div>
          <div class="${classNames.LookForwardInner}">
            ${html}
          </div>
          <div class="${classNames.LookForwardFooter}">
          </div>
        </div>
      </div>
    `);
  }
}