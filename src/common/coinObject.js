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


    static deserialize(definition) {
        let objDefinition = _.isString(definition) ? JSON.parse(definition) : definition;
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

    static deserializeCOINObjects(obj) {
        _.each(obj, (value, keyOrIndex) => {
            if (_.isPlainObject(value) && value.className) {
                obj[keyOrIndex] = this.deserialize(value);
            }
            else if (_.isArray(value)) {
                this.deserializeCOINObjects(value);
            }
        });

        return obj;
    }
}

export default COINObject