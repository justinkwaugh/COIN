import FactionIDs from 'fallingsky/config/factionIds';
import {SenateApprovalStates} from 'fallingsky/config/senateApprovalStates';
class Event5 {
    static handleEvent(state) {
        if(state.romans.senateApprovalState() !== SenateApprovalStates.ADULATION) {
            state.playersByFaction[FactionIDs.ROMANS].takeGalliaTogataLosses(state);
            return true;
        }
        return false;
    }
}

export default Event5
