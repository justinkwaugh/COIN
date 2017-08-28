import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import TurnContext from 'common/turnContext';
import HidePieces from 'fallingsky/actions/hidePieces';
import Losses from 'fallingsky/util/losses';
import Battle from 'fallingsky/commands/battle';
import MovePieces from 'fallingsky/actions/movePieces';


class Event67 {
    static handleEvent(state) {

        const treveri = state.regionsById[RegionIDs.TREVERI];
        const nervii = state.regionsById[RegionIDs.NERVII];

        if (treveri.getLegions().length === 0 && nervii.getLegions().length === 0) {
            return false;
        }
        debugger;
        const chosenMarches = _([treveri, nervii], [nervii, treveri]).filter(
            (firstRegion, secondRegion) => firstRegion.getLegions().length > 0).map((firstRegion, secondRegion) => {
            const firstData = this.getDataForRegion(state, firstRegion);
            if (!firstData) {
                return;
            }
            const marchedRegions = _(firstData.marches).map('regionId').concat([region.id]).value();
            const secondData = this.getDataForRegion(state, secondRegion, marchedRegions);

            return {
                firstData,
                secondData,
                priority: 99 - (firstData.numLegionLosses + (secondData ? secondData.numLegionLosses : 0))
            };
        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if (!chosenMarches) {
            return false;
        }

        const turn = state.turnHistory.currentTurn;
        turn.startCommand(CommandIDs.MARCH);
        _.each(chosenMarches.firstData.marches, march => {
            MovePieces.execute(
                state, {
                    sourceRegionId: march.regionId,
                    destRegionId: chosenMarches.firstData.regionId,
                    pieces: march.pieces
                });
        });
        if (chosenMarches.secondData) {
            _.each(chosenMarches.secondData.marches, march => {
                MovePieces.execute(
                    state, {
                        sourceRegionId: march.regionId,
                        destRegionId: chosenMarches.secondData.regionId,
                        pieces: march.pieces
                    });
            });
        }
        turn.commitCommand();

        turn.startCommand(CommandIDs.BATTLE);
        const battleResults = Battle.test(state, {
            region: state.regionsById[chosenMarches.firstData.regionId],
            attackingFactionId: FactionIDs.ARVERNI,
            defendingFactionId: FactionIDs.ROMANS,
        });
        Battle.execute(state, {
            battleResults
        });
        if (chosenMarches.secondData) {
            const battleResults = Battle.test(state, {
                region: state.regionsById[chosenMarches.secondData.regionId],
                attackingFactionId: FactionIDs.ARVERNI,
                defendingFactionId: FactionIDs.ROMANS,
            });
            Battle.execute(state, {
                battleResults
            });
        }
        turn.commitCommand();

        let hidPieces = false;
        _.each([RegionIDs.TREVERI, RegionIDs.NERVII], regionId => {
            const region = state.regionsById[regionId];
            const numToHide = region.getRevealedPiecesForFaction(
                    FactionIDs.BELGAE).length + region.getScoutedPiecesForFaction(FactionIDs.BELGAE).length;
            if (numToHide > 0) {
                HidePieces.execute(state, {
                    factionId: FactionIDs.BELGAE,
                    regionId
                });
                hidPieces = true;
            }
        });

        return true;
    }

    static getDataForRegion(state, region, invalidRegions = []) {
        const localPieces = region.getMobilePiecesForFaction(FactionIDs.ARVERNI);
        const marches = _(region.adjacent).reject(adjacent => _.indexOf(invalidRegions, adjacent.id)).filter(
            adjacent => adjacent.getMobilePiecesForFaction(FactionIDs.ARVERNI)).map(
            adjacent => {
                return {
                    regionId: adjacent.regionId,
                    pieces: adjacent.getMobilePiecesForFaction(FactionIDs.ARVERNI)
                }
            }).value();

        const leaderRegion = _.find(state.regions,
                                    otherRegion => otherRegion.getLeaderForFaction(FactionIDs.ARVERNI));
        const leader = leaderRegion ? leaderRegion.getLeaderForFaction(FactionIDs.ARVERNI) : null;
        if (!leader.isSuccessor() && !_.find(region.adjacent, adjacent => adjacent.id === leaderRegion.id)) {
            const warbands = leaderRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI);
            const bestPath = _(Map.findPathsToRegion(state, leaderRegion.id, region.id, 2)).map(
                (path) => {
                    const middleRegion = state.regionsById[path[1]];
                    const harassmentLosses = Losses.getHarassmentLossesForRegion(state, FactionIDs.ARVERNI,
                                                                                 middleRegion);

                    if (harassmentLosses > warbands.length) {
                        return;
                    }

                    return {
                        path,
                        harassmentLosses
                    }
                }).compact().sortBy('harassmentLosses').groupBy('harassmentLosses').map(
                _.shuffle).flatten().first();

            if (bestPath) {
                marches.push(
                    {
                        regionId: leaderRegion.id,
                        pieces: _(warbands).drop(bestPath.harassmentLosses).concat([leader])
                    });
            }
        }

        const hiddenMarchingPieces = _(marches).map('pieces').invokeMap('clone').value();
        _.each(hiddenMarchingPieces, piece => {
            if (piece.type === 'warband') {
                if (piece.scouted()) {
                    piece.scouted(false);
                    piece.revealed(true);
                }
                else if (piece.revealed()) {
                    piece.revealed(false);
                }
            }
        });

        const battlingPieces = _.concat(localPieces, hiddenMarchingPieces);
        const battleResults = Battle.test(state, {
            region: region,
            attackingFactionId: FactionIDs.ARVERNI,
            defendingFactionId: FactionIDs.ROMANS,
            attackingPieces: battlingPieces
        });

        const numLegionLosses = battleResults.getNumLossesAgainstPiecesOfType('legion', false, true);

        if (numLegionLosses === 0) {
            return;
        }

        return {
            regionId: region.id,
            marches,
            priority: 99 - numLegionLosses
        }
    }
}

export default Event67
