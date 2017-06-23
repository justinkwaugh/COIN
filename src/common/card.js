
import _ from '../lib/lodash.js';

class Card {
    constructor(definition) {
        this.id = definition.id;
        this.type = definition.type;
        this.number = definition.number;
        this.initiativeOrder = definition.initiativeOrder;
        this.title = definition.title;
        this.eventText = definition.eventText;
    }

    toString() {
        if (this.type === 'event') {
            return 'Card ' + this.id + ' - ' + this.title + ' (' + _.join(this.initiativeOrder, '/') + ')';
        }
        else {
            return this.title;
        }
    }
}

export default Card