import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import ArverniEvent from './arverniEvent';
import ArverniBattle from './arverniBattle';
import ArverniRally from './arverniRally';
import ArverniRaid from './arverniRaid';
import ArverniMarch from './arverniMarch';
import CommandModifiers from '../../commands/commandModifiers';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';

class ArverniBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ARVERNI});
    }

    takeTurn(state, modifiers = new CommandModifiers({})) {
        let commandAction = null;

        if (modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = ArverniBattle.battle(state, modifiers);
        }

        if (!commandAction && this.canPlayEvent(state) && ArverniEvent.handleEvent(state)) {
            state.sequenceOfPlay.recordFactionAction(FactionIDs.ARVERNI, FactionActions.EVENT);
            return;
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = ArverniRally.rally(state, modifiers);
        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'spread');
        }

        if (!commandAction && state.arverni.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers) || FactionActions.PASS;
        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'mass');
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers);
        }

        commandAction = commandAction || FactionActions.PASS;
        state.sequenceOfPlay.recordFactionAction(FactionIDs.ARVERNI, commandAction);
        return commandAction;
    }

}

export default ArverniBot;