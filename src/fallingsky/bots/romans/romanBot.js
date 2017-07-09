import _ from 'lib/lodash';
import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import RomanEvent from './romanEvent';
// import RomanBattle from './romanBattle';
// import RomanRecruit from './romanRecruit';
// import RomanSeize from './romanSeize';
// import RomanMarch from './romanMarch';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';
import Pass from '../../commands/pass';

const Checkpoints = {
    BATTLE_CHECK : 'battle',
    MARCH_CHECK : 'march',
    RECRUIT_CHECK: 'recruit',
    SEIZE_CHECK: 'seize',
    EVENT_CHECK : 'event',
    RALLY_CHECK : 'rally',
    SPREAD_MARCH_CHECK : 'spread-march',
    FIRST_RAID_CHECK : 'first-raid',
    MASS_MARCH_CHECK: 'mass-march',
    SECOND_RAID_CHECK : 'second-raid'

};


class RomanBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ROMANS});
    }

    takeTurn(currentState) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            // commandAction = RomanBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if(modifiers.tryThreatMarch) {
            if (!turn.getCheckpoint(Checkpoints.MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.MARCH) && modifiers.tryThreatMarch) {
                // commandAction = RomanMarch.march(state, modifiers, 'threat');
            }
            turn.markCheckpoint(Checkpoints.MARCH_CHECK);

            if (!turn.getCheckpoint(Checkpoints.RECRUIT_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.RECRUIT)) {
                // commandAction = RomanRecruit.recruit(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.RECRUIT_CHECK);

            if (!turn.getCheckpoint(Checkpoints.SEIZE_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.SEIZE)) {
                // commandAction = RomanSeize.seize(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.SEIZE_CHECK);
        }
        else {
            if (!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !commandAction && this.canPlayEvent(state) && RomanEvent.handleEvent(state)) {
                commandAction = FactionActions.EVENT;
            }
            turn.markCheckpoint(Checkpoints.EVENT_CHECK);


            if (!turn.getCheckpoint(Checkpoints.MARCH_CHECK) && !commandAction &&
                state.romans.availableAuxilia().length <= 8 &&
                modifiers.isCommandAllowed(CommandIDs.MARCH)) {
                // commandAction = RomanMarch.march(state, modifiers, 'threat');
            }
            turn.markCheckpoint(Checkpoints.MARCH_CHECK);

            if (!turn.getCheckpoint(Checkpoints.RECRUIT_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.RECRUIT)) {
                // commandAction = RomanRecruit.recruit(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.RECRUIT_CHECK);

            if (!turn.getCheckpoint(Checkpoints.SEIZE_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.SEIZE)) {
                // commandAction = RomanSeize.seize(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.SEIZE_CHECK);
        }

        commandAction = commandAction || FactionActions.PASS;

        if(commandAction === FactionActions.PASS) {
            Pass.execute(state, {factionId: FactionIDs.ROMANS});
        }

        state.sequenceOfPlay.recordFactionAction(FactionIDs.ROMANS, commandAction);
        return commandAction;
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ARVERNI;
    }

    willAgreeToSupplyLine(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    willAgreeToRetreat(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    willAgreeToQuarters(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    handleEvent(state, currentCard) {

    }
}

export default RomanBot;
