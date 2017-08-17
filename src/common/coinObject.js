import _ from 'lib/lodash';

const classRegistry = {};

class COINObject {
    serialize() {
        return JSON.stringify(this);
    }

    toJSON() {
        const plainObject = _.toPlainObject(this);
        plainObject.className = this.constructor.name;
        return plainObject;
    }


    static deserialize(json) {
        let objDefinition = JSON.parse(json);
        let objClass = this;

        if(this.prototype.constructor.name === 'COINObject') {
            objClass = classRegistry[objDefinition.className];
        }
        if(!objClass) {
            throw Error('Attempt to deserialize unknown COINObject');
        }
        return new objClass(objDefinition);
    }

    static registerClass() {
        classRegistry[this.prototype.constructor.name] = this;
    }
}

export default COINObject