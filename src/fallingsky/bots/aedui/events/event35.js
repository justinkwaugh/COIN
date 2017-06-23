import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import CommandModifiers from '../../../commands/commandModifiers';
import CommandIDs from '../../../config/commandIds';


class Event35 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const commandAction = aeduiBot.executeCommand(state, new CommandModifiers({ free: true, noBattle: true}));
        if(commandAction) {
            aeduiBot.executeCommand(state, new CommandModifiers({limited: true, free: true, restrictedCommands: [CommandIDs.BATTLE]}));
        }
        return commandAction && commandAction !== FactionActions.PASS;
    }
}

export default Event35;