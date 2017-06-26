import Action from './action'

class DisperseTribe extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.tribeId = args.tribeId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        tribe.undisperse();
        if (tribe.isDispersedGathering()) {
            console.log(tribe.name + ' is now subdued');
            faction.returnDispersalToken();
        }
        else if(tribe.isDispersed()){
            console.log(tribe.name + ' is now gathering');
        }
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        console.log('Removing dispersal token from ' + tribe.name);
        faction.returnDispersalToken();

        tribe.undisperse();
    }


    static canExecute(state, args) {
        const tribe = args.tribe;

        return tribe.isDispersed() || tribe.isDispersedGathering();
    }

    static execute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        if (tribe.isDispersedGathering()) {
            console.log(tribe.name + ' is now subdued');
            faction.returnDispersalToken();
        }
        else {
            console.log(tribe.name + ' is now gathering');
        }
        tribe.undisperse();
    }
}

export default DisperseTribe
