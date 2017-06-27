import Action from './action';

class AddResources extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.count = args.count;
        this.added = args.added;
        this.numAfter = args.numAfter;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const count = this.count;

        this.added = faction.addResources(count);
        this.numAfter = faction.resources();
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];

        faction.removeResources(this.added);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        return ['Increase ' + faction.name + ' resources by ' + this.added + ' to ' + this.numAfter];
    }

}

export default AddResources
