import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

export default class ChangeComparison extends LightningElement {
    @api title = ''
    @api headerA = 'Old Value'
    @api headerB = 'New Value'
    @api recordId;
    @api recordIdAField;
    @api recordIdBField;
    @api fieldLabelsDelimited;
    @api fieldListADelimited;
    @api fieldListBDelimited;
    @api hideMatchingValues = false;
    @track fieldLabels;
    @track fieldListA = [];
    @track fieldListB = [];
    @track rootIdFieldList = [];
    @track recordIdA;
    @track recordIdB;

    connectedCallback() {
        this.fieldLabels = this.fieldLabelsDelimited ? this.fieldLabelsDelimited.split(',') : [];
        this.fieldListA = this.fieldListADelimited ? this.fieldListADelimited.split(',') : [];
        this.fieldListB = this.fieldListBDelimited ? this.fieldListBDelimited.split(',') : [];
        this.rootIdFieldList = [this.recordIdAField, this.recordIdBField];
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$rootIdFieldList' })
    getRootRecord({ data, error }) {
        if (data) {
            if (this.recordIdAField) {
                this.recordIdA = getFieldValue(data, this.recordIdAField);
            }
            if (this.recordIdBField) {
                this.recordIdB = getFieldValue(data, this.recordIdBField);
            }
        }
        if (error) {
            console.log('error: ' + JSON.stringify(error));
        }
    }

    @wire(getRecord, { recordId: '$recordIdA', optionalFields: '$fieldListA' })
    recordA;

    @wire(getRecord, { recordId: '$recordIdB', optionalFields: '$fieldListB' })
    recordB;

    @api get rowList() {
        return this.fieldLabels.map((x, i) => {
            const valueA = this.recordA.data && this.fieldListA[i] ? getFieldValue(this.recordA.data, this.fieldListA[i]) : '';
            const valueB = this.recordB.data && this.fieldListB[i] ? getFieldValue(this.recordB.data, this.fieldListB[i]) : '';
            return {
                fieldLabel: x,
                valueA: valueA,
                valueB: valueB,
                hide: this.hideMatchingValues && valueA == valueB,
            }
        });
    }
}