window.Logi = window.Logi || {};
Logi.views = Logi.views || {};
Logi.views["contact-form"] = (function () {
  /**
   * Contact / service booking form.
   *
   * The original build only pretended to send: it showed "Sent!" and threw the
   * message away. This one actually delivers, in one of two ways:
   *
   *   - if Admin → Settings has a form endpoint (Formspree, Basin, Web3Forms,
   *     anything that accepts a JSON POST), the message is posted there;
   *   - otherwise it opens the visitor's mail client with the message pre-filled
   *     and addressed to the company e-mail.
   *
   * The fallback needs no server, which suits a site hosted on GitHub Pages, but
   * it does depend on the visitor having a mail client — so the phone numbers
   * stay prominent either way.
   */

  const { h, mount, when } = Logi.core.dom;
  const { t } = Logi.core.i18n;
  const { contacts, settings } = Logi.core.selectors;
  /**
   * @param {{title?: string}} [options]
   * @returns {HTMLElement}
   */
  function contactForm({ title } = {}) {
    const panel = h('div', {});

    const render = (state) => {
      mount(
        panel,
        when(title, () => h('h2.booking__title', { text: title })),
        state.sent
          ? h('p.form__note', { role: 'status', text: t('formSent') })
          : formFields(state, render)
      );
    };

    render({ sent: false, sending: false, error: '', values: { name: '', phone: '', msg: '' } });
    return panel;
  }

  function formFields(state, render) {
    const values = { ...state.values };

    const onInput = (key) => (event) => {
      values[key] = event.currentTarget.value;
    };

    const onSubmit = async (event) => {
      event.preventDefault();
      if (state.sending) return;

      if (!values.name.trim() || !values.phone.trim()) {
        render({ ...state, values, error: t('formRequired') });
        return;
      }

      render({ ...state, values, sending: true, error: '' });

      try {
        await deliver(values);
        render({ sent: true, sending: false, error: '', values: { name: '', phone: '', msg: '' } });
      } catch (err) {
        console.error('[contact-form]', err);
        render({ ...state, values, sending: false, error: t('formError') });
      }
    };

    return h(
      'form.form',
      { on: { submit: onSubmit }, novalidate: true },
      h('input.input', {
        type: 'text',
        name: 'name',
        value: values.name,
        placeholder: t('formName'),
        'aria-label': t('formName'),
        autocomplete: 'name',
        required: true,
        on: { input: onInput('name') },
      }),
      h('input.input', {
        type: 'tel',
        name: 'phone',
        value: values.phone,
        placeholder: t('formPhone'),
        'aria-label': t('formPhone'),
        autocomplete: 'tel',
        required: true,
        on: { input: onInput('phone') },
      }),
      h('textarea.textarea', {
        name: 'message',
        rows: '4',
        placeholder: t('formMsg'),
        'aria-label': t('formMsg'),
        value: values.msg,
        on: { input: onInput('msg') },
      }),
      when(state.error, () => h('p.form__error', { role: 'alert', text: state.error })),
      h('button.btn.btn--primary.btn--block', {
        type: 'submit',
        disabled: state.sending,
        text: state.sending ? t('formSending') : t('formSend'),
      })
    );
  }

  /**
   * Sends the message, by whichever route is configured.
   * @param {{name: string, phone: string, msg: string}} values
   */
  async function deliver(values) {
    const endpoint = settings().formEndpoint?.trim();

    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          message: values.msg,
          page: window.location.href,
        }),
      });
      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
      return;
    }

    // No endpoint configured: hand the message to the visitor's mail client.
    const email = contacts().email;
    if (!email) throw new Error('No form endpoint and no contact e-mail configured.');

    const subject = `Website enquiry — ${values.name}`;
    const body = [
      `${t('formName')}: ${values.name}`,
      `${t('formPhone')}: ${values.phone}`,
      '',
      values.msg,
    ].join('\n');

    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return { contactForm };
})();
