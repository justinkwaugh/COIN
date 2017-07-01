import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import BelgaeEvent from './belgaeEvent';
import BelgaeBattle from './belgaeBattle';
import BelgaeRally from './belgaeRally';
import BelgaeRaid from './belgaeRaid';
import BelgaeMarch from './belgaeMarch';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';
import Pass from '../../commands/pass';

class BelgaeBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.BELGAE});
    }

    takeTurn(state) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = BelgaeBattle.battle(state, modifiers);
        }

        if (!commandAction && this.shouldPassForNextCard(state)) {
            commandAction = FactionActions.PASS;
        }

        if (!commandAction && this.canPlayEvent(state) && BelgaeEvent.handleEvent(state)) {
            commandAction = FactionActions.EVENT;
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = BelgaeRally.rally(state, modifiers);
        }

        if (!commandAction && state.belgae.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers) || FactionActions.PASS;
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = BelgaeMarch.march(state, modifiers);
        }

        if (!commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers);
        }

        commandAction = commandAction || FactionActions.PASS;

        if (commandAction === FactionActions.PASS) {
            Pass.execute(state, {factionId: FactionIDs.BELGAE});
        }

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