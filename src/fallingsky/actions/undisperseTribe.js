import Action from './action';

class UndisperseTribe extends Action {

    constructor(args) {
        super(args);

        this.tribeId = args.tribeId;
        this.gathering = args.gathering;
        this.subdued = args.subdued;
        this.wasDispersed = args.wasDispersed;
        this.fully = args.fully;
    }

    doExecute(state) {
        const faction = state.romans;
        const tribe = state.tribesById[this.tribeId];

        this.wasDispersed = tribe.isDispersed();
        this.wasGathering = tribe.isDispersedGathering();

        if (tribe.isDispersedGathering() || this.fully) {
            console.log(tribe.name + ' is now subdued');
            this.subdued = true;
            faction.returnDispersalToken();
        }
        else if(tribe.isDispersed()){
            this.gathering = true;
            console.log(tribe.name + ' is now gathering');
        }
        tribe.undisperse(this.fully);
    }

    doUndo(state) {
        const faction = state.romans;
        const tribe = state.tribesById[this.tribeId];

        if(this.subdued) {
            faction.removeDispersalToken();
            if(this.wasDispersed) {
                tribe.disperse();
            }
            else {
                tribe.disperseGathering();
            }
            console.log(tribe.name + ' is now back to gathering');
        }
        else {
            tribe.disperse();
            console.log(tribe.name + ' is now back to dispersed');
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
