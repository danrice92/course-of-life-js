import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default class EmailVerificationForm extends Component {
  @service cookies;
  @service router;
  @service store;

  fields = [
    { position: 1, value: '' },
    { position: 2, value: '' },
    { position: 3, value: '' },
    { position: 4, value: '' },
    { position: 5, value: '' },
    { position: 6, value: '' }
  ];

  fieldAtPosition = (position) => {
    return document.querySelector(`input[data-position="${position}"]`);
  };

  fetchUser = async () => {
    const cookies = this.cookies.read();
    const user = await this.store.queryRecord('user', {
      authentication_token: cookies.bristleCUT
    });
    return user;
  };

  submitForm = async () => {
    const valueArray = _.map(this.fields, (field) => field.value);
    const verificationCode = _.join(valueArray, '');
    let user = await this.store.peekAll('user');
    user = user.lastObject || (await this.fetchUser());
    user.verificationCode = verificationCode;
    const response = await user.save();

    if (response.emailVerified) {
      this.router.transitionTo('dashboard');
    }
  };

  setValue = ({ field, position, value }) => {
    field.value = value;
    const fieldState = _.find(this.fields, { position });
    fieldState.value = value;
  };

  @action handleKeyDown(event) {
    const { key, metaKey, target } = event;
    if (!event.metaKey) event.preventDefault();
    const initialValue = target.value;
    const position = _.toNumber(target.dataset.position);

    switch (key) {
      case 'Backspace': {
        if (_.isEmpty(initialValue) && position > 1) {
          const previousField = this.fieldAtPosition(position - 1);
          this.setValue({
            field: previousField,
            position: position - 1,
            value: ''
          });
          previousField.focus();
        } else {
          this.setValue({ field: target, position, value: '' });
        }
        break;
      }
      case 'Delete': {
        this.setValue({ field: target, position, value: '' });
        break;
      }
      default: {
        if (metaKey || key.length !== 1) return;

        const value = _.capitalize(_.toString(key));
        this.setValue({ field: target, position, value });
        if (position < 6) {
          this.fieldAtPosition(position + 1).focus();
        } else {
          this.submitForm();
        }
      }
    }
  }
}
