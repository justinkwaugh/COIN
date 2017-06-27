import Action from './action'

class UndisperseTribe extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.tribeId = args.tribeId;
        this.gathering = args.gathering;
        this.subdued = args.subdued;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        if (tribe.isDispersedGathering()) {
            console.log(tribe.name + ' is now subdued');
            this.subdued = true;
            faction.returnDispersalToken();
        }
        else if(tribe.isDispersed()){
            this.gathering = true;
            console.log(tribe.name + ' is now gathering');
        }
        tribe.undisperse();
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        if(this.subdued) {
            faction.removeDispersalToken();
            tribe.disperseGathering();
        }
        else {
            tribe.disperse();
        }
    }

    instructions(state) {
        const tribe = state.tribesById[this.tribeId];
        if(this.subdued) {
            return ['Remove dispersed marker from ' + tribe.name];
        } else {
            return ['Flip dispersed marker on ' + tribe.name + ' to gathering'];
        }
    }
}

export default UndisperseTribe
