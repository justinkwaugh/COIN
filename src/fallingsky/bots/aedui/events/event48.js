import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import CommandModifiers from '../../../commands/commandModifiers';

class Event48 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const commandAction = aeduiBot.executeCommand(
            state, new CommandModifiers(
                {
                    free: true,
                    limited: true,
                    allowLimitedSpecial: true
                }));
        if (commandAction && commandAction !== FactionActions.PASS) {
            state.sequenceOfPlay.remainEligible(FactionIDs.AEDUI);
            return true;
        }
        return false;
    }
}

export default Event48;