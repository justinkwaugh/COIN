class Turn {
    constructor(definition) {
        this.number = definition.number;
        this.factionId = definition.factionId;
        this.commandAction = definition.commandAction;
        this.actionStartIndex = definition.actionStartIndex;
        this.actionEndIndex = definition.actionEndIndex;
    }

    getInstructions(state) {
        if(this.actionEndIndex <= this.actionStartIndex) {
            return [];
        }
        return _(state.actionHistory.getActionRange(this.actionStartIndex, this.actionEndIndex)).invokeMap('instructions', state).flatten().value();
    }

}

export default Turn;