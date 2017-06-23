import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import CommandModifiers from '../../../commands/commandModifiers';

class Event46 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const commandAction = aeduiBot.executeCommand(state, new CommandModifiers({ free: true, noSpecial: true }));
        if(commandAction && commandAction !== FactionActions.PASS) {
            state.sequenceOfPlay.remainEligible(FactionIDs.AEDUI);
            return true;
        }
        return false;
    }
}

export default Event46;