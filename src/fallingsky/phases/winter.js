import FactionIDs from '../config/factionIds';
import Turn from '../../common/turn';
import UndisperseTribe from '../actions/undisperseTribe';
import AddResources from '../actions/addResources';
import HidePieces from '../actions/hidePieces';

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
        const germanicBot = state.playersByFaction[FactionIDs.GERMANIC_TRIBES];
        germanicBot.takeTurn(state);
    }

    static quarters(state) {
        console.log('*** Quarters Phase ***');
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
    }

    static harvest(state) {
        console.log('*** Harvest Phase ***');
        const romans = state.factionsById[FactionIDs.ROMANS];
        const romanVictory = romans.victoryScore(state);
        if(romanVictory > 0) {
            AddResources.execute(state, { factionId: FactionIDs.ROMANS, count: romanVictory});
        }

        _.each([FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.BELGAE], function(factionId) {
            const faction = state.factionsById[factionId];
            let resources = faction.numAlliedTribesAndCitadelsPlaced()*2;
            if(factionId == FactionIDs.AEDUI) {
                resources += 4;
            }
            if(resources > 0) {
                AddResources.execute(state, { factionId: faction.id, count: resources});
            }
        });
    }

    static senate(state) {
        console.log('*** Senate Phase ***');
        const romans = state.factionsById[FactionIDs.ROMANS];
        romans.adjustSenateApproval(state);
        romans.returnLegionsFromFallen();
        romans.placeWinterAuxilia(state);
    }

    static spring(state) {
        console.log('*** Spring Phase ***');

        _.each(state.playersByFaction, function(player) {
            player.placeLeader(state);
        });
        const romans = state.factionsById[FactionIDs.ROMANS];
        romans.returnLegionsFromFallen({spring : true});
        _.each(state.tribes, function(tribe) {
            if(tribe.isDispersed() || tribe.isDispersedGathering()) {
                UndisperseTribe.execute(state, {factionId: romans.id, tribeId: tribe.id});
            }
        });
        _.each(state.regions, function(region) {
            region.devastated(false);
            _.each(state.factions, function(faction) {
                HidePieces.execute(state, {factionId: faction.id, regionId: region.id});
            });
        });
        state.sequenceOfPlay.resetEligibility();
        state.yearsRemaining(state.yearsRemaining-1);
    }
}

export default Winter;