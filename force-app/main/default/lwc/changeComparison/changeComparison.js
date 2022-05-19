import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
const METADATA_FIELDS = [
    'Change_Comparison_Mapping__mdt.Field_Labels__c',
    'Change_Comparison_Mapping__mdt.Hide_Matching_Values__c',
    'Change_Comparison_Mapping__mdt.Root_Record_Api_Name__c',
    'Change_Comparison_Mapping__mdt.Title__c',
    'Change_Comparison_Mapping__mdt.ValueA_Api_Name__c',
    'Change_Comparison_Mapping__mdt.ValueA_Fields__c',
    'Change_Comparison_Mapping__mdt.ValueA_Header__c',
    'Change_Comparison_Mapping__mdt.ValueA_Id_Field__c',
    'Change_Comparison_Mapping__mdt.ValueB_Api_Name__c',
    'Change_Comparison_Mapping__mdt.ValueB_Fields__c',
    'Change_Comparison_Mapping__mdt.ValueB_Header__c',
    'Change_Comparison_Mapping__mdt.ValueB_Id_Field__c',
];

export default class ChangeComparison extends LightningElement {
    @api recordId;
    @api metadataId;
    @track title = ''
    @track headerA = 'Old Value'
    @track headerB = 'New Value'
    @track recordIdAField;
    @track recordIdBField;
    @track hideMatchingValues = false;
    @track fieldLabels = [];
    @track fieldListA = [];
    @track fieldListB = [];
    @track rootIdFieldList = [];
    @track recordIdA;
    @track recordIdB;

    @api get fieldListAFiltered() {
        return this.fieldListA.filter(x => x);
    }

    @api get fieldListBFiltered() {
        return this.fieldListB.filter(x => x);
    }

    connectedCallback() {
        console.log('recordId: ' + this.recordId);
        console.log('metadataId: ' + this.metadataId);
    }

    @wire(getRecord, { recordId: '$metadataId', fields: METADATA_FIELDS })
    getMetadata({data, error}) {
        if (data) {
            console.log(data);
            this.fieldLabels = data.fields.Field_Labels__c.value.split('\n').map(x => x.trim());
            this.hideMatchingValues = data.fields.Hide_Matching_Values__c.value;
            this.recordIdAField = data.fields.Root_Record_Api_Name__c.value + '.' + data.fields.ValueA_Id_Field__c.value;
            this.recordIdBField = data.fields.Root_Record_Api_Name__c.value + '.' + data.fields.ValueB_Id_Field__c.value;
            this.rootIdFieldList = [this.recordIdAField, this.recordIdBField];
            this.title = data.fields.Title__c.value;
            this.fieldListA = data.fields.ValueA_Fields__c.value.split('\n').map(x => data.fields.ValueA_Api_Name__c.value + '.' + x.trim());
            this.fieldListB = data.fields.ValueB_Fields__c.value.split('\n').map(x => data.fields.ValueB_Api_Name__c.value + '.' + x.trim());
            this.headerA = data.fields.ValueA_Header__c.value;
            this.headerB = data.fields.ValueB_Header__c.value;
        }
        if (error) {
            console.log('error: ' + JSON.stringify(error));
        }
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

    @wire(getRecord, { recordId: '$recordIdA', optionalFields: '$fieldListAFiltered' })
    recordA;

    @wire(getRecord, { recordId: '$recordIdB', optionalFields: '$fieldListBFiltered' })
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