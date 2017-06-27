import Action from './action';

class RemoveResources extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.count = args.count;
        this.removed = args.removed;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const count = this.count;

        this.removed = faction.removeResources(count);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];

        faction.addResources(this.removed);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        return ['Decrease ' + faction.name + ' resources by ' + this.removed];
    }

}

export default RemoveResources
