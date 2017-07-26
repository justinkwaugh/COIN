import _ from 'lib/lodash';
import FactionIDs from '../config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import TurnContext from 'common/turnContext';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import UndisperseTribe from '../actions/undisperseTribe';
import AddResources from '../actions/addResources';
import HidePieces from '../actions/hidePieces';
import UndevastateRegion from '../actions/undevastateRegion';

class Winter {

    static executeWinter(state) {
        console.log('*** Winter ***');
        state.turnHistory.startTurn(FactionIDs.GERMANIC_TRIBES);
        const victor = this.victoryCheck(state);
        if(victor) {
            state.victor(victor.id);
            state.gameEnded(true);
        }
        else {
            this.germanPhase(state);
            this.quarters(state);
            this.harvest(state);
            this.winterCampaign(state);
            this.senate(state);
            this.spring(state);
        }
        state.turnHistory.commitTurn('Winter');
    }

    static victoryCheck(state) {
        console.log('*** Checking victory ***');
        const factionsByVictoryMargin = _(state.factions).reject(faction=>faction.id === FactionIDs.GERMANIC_TRIBES).sortBy(
            (faction) => {
                let priority = '' + (50 - faction.victoryMargin(state));
                if (state.playersByFaction[faction.id].isNonPlayer) {
                    priority += '-' + 'a';
                }
                else if (faction.id === FactionIDs.ROMANS) {
                    priority += '-' + 'b';
                }
                else if (faction.id === FactionIDs.ARVERNI) {
                    priority += '-' + 'c';
                }
                else if (faction.id === FactionIDs.AEDUI) {
                    priority += '-' + 'd';
                }
                else if (faction.id === FactionIDs.BELGAE) {
                    priority += '-' + 'd';
                }
                return priority;
            }).value();

        _.each(factionsByVictoryMargin, (faction) => {
            console.log('    ' + faction.name + ' margin of victory is ' + faction.victoryMargin(state))
        });

        const best = _.first(factionsByVictoryMargin);
        if(state.isLastYear() || (best.victoryMargin(state) > 0 && state.playersByFaction[best.id].isNonPlayer)) {
            return best;
        }
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
        if (romanVictory > 0) {
            AddResources.execute(state, {factionId: FactionIDs.ROMANS, count: romanVictory});
        }

        _.each([FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.BELGAE], function (factionId) {
            const faction = state.factionsById[factionId];
            let resources = faction.numAlliedTribesAndCitadelsPlaced() * 2;
            if (factionId === FactionIDs.AEDUI) {
                resources += 4;
            }
            if (resources > 0) {
                AddResources.execute(state, {factionId: faction.id, count: resources});
            }
        });
        turn.commitPhase();
    }

    static winterCampaign(state) {
        const turn = state.turnHistory.currentTurn;
        turn.startPhase('Winter Campaign');
        if(state.hasShadedCapability(CapabilityIDs.WINTER_CAMPAIGN, FactionIDs.ARVERNI)) {
            const arverni = state.playersByFaction[FactionIDs.ARVERNI];
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.ARVERNI, noEvent: true, outOfSequence: true }));
            arverni.takeTurn(state);
            turn.popContext();
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.ARVERNI, noEvent: true, outOfSequence: true }));
            arverni.takeTurn(state);
            turn.popContext();
        }
        else if(state.hasShadedCapability(CapabilityIDs.WINTER_CAMPAIGN, FactionIDs.BELGAE)) {
            const belgae = state.playersByFaction[FactionIDs.BELGAE];
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.BELGAE, noEvent: true, outOfSequence: true}));
            belgae.takeTurn(state);
            turn.popContext();
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.BELGAE, noEvent: true, outOfSequence: true}));
            belgae.takeTurn(state);
            turn.popContext();
        }
        else if(state.hasShadedCapability(CapabilityIDs.WINTER_CAMPAIGN, FactionIDs.AEDUI)) {
            const aedui = state.playersByFaction[FactionIDs.AEDUI];
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.AEDUI, noEvent: true, outOfSequence: true}));
            aedui.takeTurn(state);
            turn.popContext();
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.AEDUI, noEvent: true, outOfSequence: true}));
            aedui.takeTurn(state);
            turn.popContext();
        }
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
        _.each(state.playersByFaction, function (player) {
            player.placeLeader(state);
        });
        const romans = state.factionsById[FactionIDs.ROMANS];
        romans.returnLegionsFromFallen(state, {spring: true});
        _.each(state.tribes, function (tribe) {
            if (tribe.isDispersed() || tribe.isDispersedGathering()) {
                UndisperseTribe.execute(state, {factionId: romans.id, tribeId: tribe.id});
            }
        });
        _.each(state.regions, function (region) {
            if (region.devastated()) {
                UndevastateRegion.execute(state, {regionId: region.id});
            }
            _.each(state.factions, function (faction) {
                HidePieces.execute(state, {factionId: faction.id, regionId: region.id});
            });
        });
        state.sequenceOfPlay.resetEligibility();
        turn.commitPhase();
    }
}

export default Winter;