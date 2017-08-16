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

        console.log('Dispersing ' + tribe.name + '');
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const tribe = state.tribesById[this.tribeId];

        console.log('Removing dispersal token from ' + tribe.name);
        faction.returnDispersalToken();

        tribe.undisperse(true);
    }

    instructions(state) {
        const tribe = state.tribesById[this.tribeId];
        return ['Place dispersed marker on ' + tribe.name];
    }

}

export default DisperseTribe;
