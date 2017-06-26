import Action from './action';
import FactionIDs from '../../fallingsky/config/factionIds';

class DisperseTribe extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.tribeId = args.tribeId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        if(faction.id !== FactionIDs.ROMANS || !faction.hasAvailableDispersalTokens() || !tribe.isSubdued()) {
            throw 'Invalid DisperseTribe Action';
        }

        faction.removeDispersalToken();
        tribe.disperse();

        console.log('Dispersing ' + tribe.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        console.log('Removing dispersal token from ' + tribe.name);
        faction.returnDispersalToken();

        tribe.undisperse();
    }

    static canExecute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        return faction.hasAvailableDispersalTokens() && tribe.isSubdued();
    }

    static execute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        faction.removeDispersalToken();
        tribe.disperse();
    }
}

export default DisperseTribe
