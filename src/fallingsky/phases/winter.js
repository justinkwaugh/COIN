import FactionIDs from '../config/factionIds';
import UndisperseTribe from '../actions/undisperseTribe';
import HidePieces from '../actions/hidePieces';

class Winter {

    static executeWinter(state) {
        console.log('*** Winter ***');
        this.victoryCheck(state);
        this.germanPhase(state);
        this.quarters(state);
        this.harvest(state);
        this.senate(state);
        this.spring(state);
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
            romans.addResources(romanVictory);
        }

        _.each([FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.BELGAE], function(factionId) {
            const faction = state.factionsById[factionId];
            let resources = faction.numAlliedTribesAndCitadelsPlaced()*2;
            if(factionId == FactionIDs.AEDUI) {
                resources += 4;
            }
            if(resources > 0) {
                faction.addResources(resources);
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
            UndisperseTribe.perform(state, { faction: romans, tribe: tribe });
        });
        _.each(state.regions, function(region) {
            region.devastated(false);
            _.each(state.factions, function(faction) {
                HidePieces.run(state, {factionId: faction.id, regionId: region.id});
            });
        });
        state.sequenceOfPlay.resetEligibility();
        state.yearsRemaining(state.yearsRemaining-1);
    }
}

export default Winter;