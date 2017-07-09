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

const Checkpoints = {
    BATTLE_CHECK : 'battle',
    THREAT_MARCH_CHECK : 'threat-march',
    PASS_CHECK: 'pass',
    EVENT_CHECK : 'event',
    RALLY_CHECK : 'rally',
    CONTROL_MARCH_CHECK : 'control-march',
    FIRST_RAID_CHECK : 'first-raid',
    SECOND_RAID_CHECK : 'second-raid'
};

class BelgaeBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.BELGAE});
    }

    takeTurn(state) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = BelgaeBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if(!turn.getCheckpoint(Checkpoints.THREAT_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH) && modifiers.context.tryThreatMarch) {
            commandAction = BelgaeMarch.march(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.THREAT_MARCH_CHECK);

        if(!turn.getCheckpoint(Checkpoints.PASS_CHECK) && !commandAction && this.shouldPassForNextCard(state)) {
            commandAction = FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.PASS_CHECK);

        if(!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !commandAction && this.canPlayEvent(state) && BelgaeEvent.handleEvent(state)) {
            commandAction = FactionActions.EVENT;
        }
        turn.markCheckpoint(Checkpoints.EVENT_CHECK);

        if(!turn.getCheckpoint(Checkpoints.RALLY_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = BelgaeRally.rally(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.RALLY_CHECK);

        if(!turn.getCheckpoint(Checkpoints.FIRST_RAID_CHECK) && !commandAction && state.belgae.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers) || FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.FIRST_RAID_CHECK);

        if(!turn.getCheckpoint(Checkpoints.CONTROL_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = BelgaeMarch.march(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.CONTROL_MARCH_CHECK);

        if(!turn.getCheckpoint(Checkpoints.SECOND_RAID_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = BelgaeRaid.raid(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.SECOND_RAID_CHECK);

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