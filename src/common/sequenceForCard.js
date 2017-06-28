import ko from '../lib/knockout';

class SequenceForCard {
    constructor(definition = {}) {
        this.actions = ko.observableArray(definition.actions || []);
        this.eligible = definition.eligible || [];
        this.ineligible = definition.ineligible || [];
    }

    addAction(factionId, actionId) {
        this.actions.push( { factionId, actionId });
    }

    numActionsTaken() {
        return this.actions().length;
    }

    popAction() {
        return this.actions.pop();
    }

}

export default SequenceForCard;