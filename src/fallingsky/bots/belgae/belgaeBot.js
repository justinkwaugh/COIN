import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import BelgaeEvent from './belgaeEvent';
import BelgaeBattle from './belgaeBattle';
import BelgaeRally from './belgaeRally';
import BelgaeRaid from './belgaeRaid';
import BelgaeMarch from './belgaeMarch';
import CommandModifiers from '../../commands/commandModifiers';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';

class BelgaeBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.BELGAE});
    }

    takeTurn(state, modifiers = new CommandModifiers({})) {
        let commandAction = null;

        if (modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = BelgaeBattle.battle(state, modifiers);
        }

        if (!commandAction && this.shouldPassForNextCard(state)) {
            state.sequenceOfPlay.recordFactionAction(FactionIDs.BELGAE, FactionActions.PASS);
            return;
        }

        if (!commandAction && this.canPlayEvent(state) && BelgaeEvent.handleEvent(state)) {
            state.sequenceOfPlay.recordFactionAction(FactionIDs.BELGAE, FactionActions.EVENT);
            return;
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = BelgaeRally.rally(state, modifiers);
        }

        if (!commandAction && state.belgae.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers) || FactionActions.PASS;

        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = BelgaeMarch.march(state, modifiers);
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers);
        }

        commandAction = commandAction || FactionActions.PASS;
        state.sequenceOfPlay.recordFactionAction(FactionIDs.BELGAE, commandAction);
        return commandAction;
    }

    shouldPassForNextCard(state) {
        return state.upcomingCard() &&
               state.upcomingCard().type !== 'winter' &&
               state.upcomingCard().initiativeOrder[0] === FactionIDs.BELGAE &&
               state.currentCard().initiativeOrder[0] !== FactionIDs.BELGAE &&
               _.random(1, 6) < 5;
    }
}

export default BelgaeBot;