import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import March from '../../commands/march';
import MovePieces from '../../actions/movePieces';
import HidePieces from '../../actions/hidePieces';

class GermanicMarch {

    static march(state, modifiers) {
        console.log('*** Germanic March ***');
        let effective = false;
        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
        const marchResults = March.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});

        let validMarches = _(marchResults).filter((marchResult) => {
            return this.getMarchingWarbands(marchResult.region).length > 0;
        }).value();

        const factionOrderById = this.getEnemyFactionOrder(state);

        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.MARCH);

        while(validMarches.length > 0) {
            validMarches = _(validMarches).sortBy((marchResult) => {
                return 99 - this.getMarchingWarbands(marchResult.region).length;
            }).value();

            const nextMarch = validMarches.shift();

            const marchingWarbands = this.getMarchingWarbands(nextMarch.region);
            const destination = this.findHighestPriorityDestination(nextMarch.destinations, factionOrderById,  marchingWarbands.length);
            if (!modifiers.winter) {
                HidePieces.execute(
                    state, {
                        factionId: germanicFaction.id,
                        regionId: nextMarch.region.id,
                    });
            }
            MovePieces.execute(
                state, {
                    sourceRegionId: nextMarch.region.id,
                    destRegionId: destination.id,
                    pieces: marchingWarbands
                });
            effective = true;
        }

        if(modifiers.winter) {
            this.hideAllWarbands(state, germanicFaction);
        }
        turn.commitCommand();
        return effective;
    }

    static hideAllWarbands(state, faction) {
        _.each(state.regions, function(region) {
            const mobilePieces = region.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES);
            if(mobilePieces.length) {
                HidePieces.execute(
                    state, {
                        factionId: faction.id,
                        regionId: region.id
                    });
            }
        })
    }

    static getMarchingWarbands(region) {
        const mobilePieces = _(region.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES)).sortBy(function(piece) {
            if (piece.scouted()) {
                return 'a';
            }
            else if(piece.revealed()) {
                return 'b';
            }
            else {
                return 'c';
            }
        }).value();
        const numMarching = Math.min(mobilePieces.length, region.controllingMarginByFaction()[FactionIDs.GERMANIC_TRIBES] - 1);
        return _.take(mobilePieces, numMarching);
    }

    static getEnemyFactionOrder(state) {
        const factionOrder = _(state.factions).reject({id: FactionIDs.GERMANIC_TRIBES}).partition('isNonPlayer').map(_.shuffle).flatten().sortBy('isNonPlayer').value();
        const factionOrderById = {};
        _.each(
            factionOrder, function (faction, index) {
                factionOrderById[faction.id] = index + 1;
            });
        return factionOrderById;
    }

    static findHighestPriorityDestination(destinations, factionOrderById, numMarchablePieces) {
        return _(destinations).map(
            function (destination) {
                let destinationPriority = 'c';

                const controlMarginAfterPlacement = destination.controllingMarginByFaction()[FactionIDs.GERMANIC_TRIBES] + numMarchablePieces;
                if (controlMarginAfterPlacement <= 0) {
                    destinationPriority += 'a' + (factionOrderById[destination.controllingFactionId()] || 9);
                }
                else {
                    destinationPriority += 'b' + (factionOrderById[destination.controllingFactionId()] || 9);
                }

                return {
                    destination: destination,
                    priority: destinationPriority
                };
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first().destination;
    }
}

export default GermanicMarch;