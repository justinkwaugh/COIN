import FactionIDs from '../config/factionIds';
import Turn from '../../common/turn';
import UndisperseTribe from '../actions/undisperseTribe';
import AddResources from '../actions/addResources';
import HidePieces from '../actions/hidePieces';
import UndevastateRegion from '../actions/undevastateRegion';

class Winter {

    static executeWinter(state) {
        console.log('*** Winter ***');
        state.turnHistory.startTurn(FactionIDs.GERMANIC_TRIBES);
        this.victoryCheck(state);
        this.germanPhase(state);
        this.quarters(state);
        this.harvest(state);
        this.senate(state);
        this.spring(state);
        state.turnHistory.commitTurn('Winter');
    }

    static victoryCheck(state) {
        console.log('*** Checking victory ***');

        _(state.factions).sortBy(function(faction) {
            return faction.victoryMargin(state);
        }).reverse().each(function(faction) {
            console.log('    ' + faction.name + ' margin of victory is ' + faction.victoryMargin(state))
        });
    }

    static germanPhase(state) {
        console.log('*** German Phase ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startPhase('Germans');
        const germanicBot = state.playersByFaction[FactionIDs.GERMANIC_TRIBES];
        germanicBot.takeTurn(state);
        turn.commitPhase()
    }

    static quarters(state) {
        console.log('*** Quarters Phase ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startPhase('Quarters');
        const germans = state.playersByFaction[FactionIDs.GERMANIC_TRIBES];
        const belgae = state.playersByFaction[FactionIDs.BELGAE];
        const aedui = state.playersByFaction[FactionIDs.AEDUI];
        const arverni = state.playersByFaction[FactionIDs.ARVERNI];
        const romans = state.playersByFaction[FactionIDs.ROMANS];

        germans.quarters(state);
        belgae.quarters(state);
        aedui.quarters(state);
        arverni.quarters(state);
        romans.quarters(state);
        turn.commitPhase()
    }

    static harvest(state) {
        console.log('*** Harvest Phase ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startPhase('Harvest');
        const romans = state.factionsById[FactionIDs.ROMANS];
        const romanVictory = romans.victoryScore(state);
        if(romanVictory > 0) {
            AddResources.execute(state, { factionId: FactionIDs.ROMANS, count: romanVictory});
        }

        _.each([FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.BELGAE], function(factionId) {
            const faction = state.factionsById[factionId];
            let resources = faction.numAlliedTribesAndCitadelsPlaced()*2;
            if(factionId === FactionIDs.AEDUI) {
                resources += 4;
            }
            if(resources > 0) {
                AddResources.execute(state, { factionId: faction.id, count: resources});
            }
        });
        turn.commitPhase();
    }

    static senate(state) {
        console.log('*** Senate Phase ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startPhase('Senate');
        const romans = state.factionsById[FactionIDs.ROMANS];
        romans.adjustSenateApproval(state);
        romans.returnLegionsFromFallen(state);
        romans.placeWinterLegions(state);
        romans.placeWinterAuxilia(state);
        turn.commitPhase();
    }

    static spring(state) {
        console.log('*** Spring Phase ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startPhase('Spring');
        _.each(state.playersByFaction, function(player) {
            player.placeLeader(state);
        });
        const romans = state.factionsById[FactionIDs.ROMANS];
        romans.returnLegionsFromFallen(state, {spring : true});
        _.each(state.tribes, function(tribe) {
            if(tribe.isDispersed() || tribe.isDispersedGathering()) {
                UndisperseTribe.execute(state, {factionId: romans.id, tribeId: tribe.id});
            }
        });
        _.each(state.regions, function(region) {
            if(region.devastated()) {
                UndevastateRegion.execute(state, {regionId: region.id });
            }
            _.each(state.factions, function(faction) {
                HidePieces.execute(state, {factionId: faction.id, regionId: region.id});
            });
        });
        state.sequenceOfPlay.resetEligibility();
        turn.commitPhase();
    }
}

export default Winter;