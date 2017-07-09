import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import ArverniEvent from './arverniEvent';
import ArverniBattle from './arverniBattle';
import ArverniRally from './arverniRally';
import ArverniRaid from './arverniRaid';
import ArverniMarch from './arverniMarch';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';
import Pass from '../../commands/pass';

const Checkpoints = {
    BATTLE_CHECK : 'battle',
    THREAT_MARCH_CHECK : 'threat-march',
    EVENT_CHECK : 'event',
    RALLY_CHECK : 'rally',
    SPREAD_MARCH_CHECK : 'spread-march',
    FIRST_RAID_CHECK : 'first-raid',
    MASS_MARCH_CHECK: 'mass-march',
    SECOND_RAID_CHECK : 'second-raid'

};

class ArverniBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ARVERNI});
    }

    takeTurn(state) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = ArverniBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if(!turn.getCheckpoint(Checkpoints.THREAT_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH) && modifiers.context.tryThreatMarch) {
            commandAction = ArverniMarch.march(state, modifiers, 'threat');
        }
        turn.markCheckpoint(Checkpoints.THREAT_MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !commandAction && this.canPlayEvent(state) && ArverniEvent.handleEvent(state)) {
            commandAction = FactionActions.EVENT;
        }
        turn.markCheckpoint(Checkpoints.EVENT_CHECK);

        if (!turn.getCheckpoint(Checkpoints.RALLY_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = ArverniRally.rally(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.RALLY_CHECK);

        if(!turn.getCheckpoint(Checkpoints.SPREAD_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'spread');
        }
        turn.markCheckpoint(Checkpoints.SPREAD_MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.FIRST_RAID_CHECK) && !commandAction && state.arverni.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers) || FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.FIRST_RAID_CHECK);

        if(!turn.getCheckpoint(Checkpoints.MASS_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'mass');
        }
        turn.markCheckpoint(Checkpoints.MASS_MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.SECOND_RAID_CHECK) && !commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.SECOND_RAID_CHECK);

        commandAction = commandAction || FactionActions.PASS;

        if(commandAction === FactionActions.PASS) {
            Pass.execute(state, {factionId: FactionIDs.ARVERNI});
        }

        state.sequenceOfPlay.recordFactionAction(FactionIDs.ARVERNI, commandAction);
        return commandAction;
    }

}

export default ArverniBot;