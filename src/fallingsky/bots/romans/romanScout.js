import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import EnemyFactionPriority from 'fallingsky/bots/romans/enemyFactionPriority';
import Scout from '../../commands/romans/scout';
import RemoveResources from 'fallingsky/actions/removeResources';
import MovePieces from 'fallingsky/actions/movePieces';
import RevealPieces from 'fallingsky/actions/revealPieces';
import ScoutPieces from 'fallingsky/actions/scoutPieces';


class RomanScout {
    static scout(state, modifiers) {

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.SCOUT);
        if (this.doScouts(state, modifiers)) {
            state.turnHistory.getCurrentTurn().commitSpecialAbility();
        }
        else {
            state.turnHistory.getCurrentTurn().rollbackSpecialAbility();
        }


        return true;
    }

    static doScouts(state, modifiers) {
        const scoutResults = Scout.test(state);
        const regionsWithSupply = this.regionsWithSupply(state);
        const possibleScouts = this.getPossibleScouts(state, modifiers, regionsWithSupply, scoutResults);

        const regionsAdjacentWithNumNeeded = _(possibleScouts).map(
            (possibleScout) => { return possibleScout.scout.moveRegions; }).flatten().uniqBy('id').map((region) => {

            if (region.controllingFactionId() === FactionIDs.ROMANS) {
                return;
            }
            const enemyControlMargin = region.getMaxEnemyControllingMargin(FactionIDs.ROMANS);
            if (enemyControlMargin <= 0) {
                return;
            }

            return {
                region,
                numAuxiliaForSupply: enemyControlMargin
            };

        }).compact().filter(regionData => {
            const numCanMoveHere = _.reduce(possibleScouts, (sum, possibleScout) => {
                if (_.find(possibleScout.scout.moveRegions,
                           scoutMoveRegion => scoutMoveRegion.id === regionData.region.id)) {
                    return sum + possibleScout.numAuxiliaCanMoveForSupply;
                }
                return sum;
            }, 0);

            return numCanMoveHere >= regionData.numAuxiliaForSupply;
        }).value();

        let effective = false;
        const scoutForSupplyMoves = this.getScoutForSupplyMoves(state, possibleScouts, regionsAdjacentWithNumNeeded,
                                                                regionsWithSupply.length);

        _.each(scoutForSupplyMoves, move => {
            effective = true;
            MovePieces.execute(
                state, {
                    sourceRegionId: move.sourceRegionId,
                    destRegionId: move.destRegionId,
                    pieces: _.take(
                        state.regionsById[move.sourceRegionId].getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS),
                        move.numMoved)
                });
        });

        // We need to recalculate these now that we have done some moves.
        const updatedRegionsWithSupply = this.regionsWithSupply(state);
        const updatedPossibleScouts = this.getPossibleScouts(state, modifiers, updatedRegionsWithSupply, scoutResults);
        const scoutToJoinLegionMoves = this.getScoutToJoinLegionMoves(state, updatedPossibleScouts);
        _.each(scoutToJoinLegionMoves, move => {
            effective = true;
            MovePieces.execute(
                state, {
                    sourceRegionId: move.sourceRegionId,
                    destRegionId: move.destRegionId,
                    pieces: _.take(
                        state.regionsById[move.sourceRegionId].getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS),
                        move.numMoved)
                });
        });

        let scoutsToReveal = this.getScoutsToReveal(state);
        if(state.hasShadedCapability(CapabilityIDs.TITUS_LABIENUS)) {
            scoutsToReveal = _.take(scoutsToReveal, 1);
        }
        _.each(scoutsToReveal, scout => {
            effective = true;
            RevealPieces.execute(state, { factionId: FactionIDs.ROMANS, regionId: scout.regionId, count: scout.hiddenCount });
            _.each(scout.piecesToScout, (piecesForFaction, factionId) => {
                ScoutPieces.execute(state, { factionId: factionId, regionId: scout.regionId, pieces: piecesForFaction });
            });
        });
        return effective;
    }

    static getPossibleScouts(state, modifiers, regionsWithSupply, scoutResults) {

        return _(scoutResults).shuffle().map((scout) => {
            return {
                scout,
                numAuxiliaCanMoveForSupply: this.determineNumAuxiliaCanMove(state, scout.region, regionsWithSupply)
            };
        }).value();
    }

    static permute(permutation) {
        const length = permutation.length;
        const result = [permutation.slice()];
        let c = new Array(length).fill(0);
        let i = 1;
        let k;
        let p;

        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i];
                permutation[i] = permutation[k];
                permutation[k] = p;
                ++c[i];
                i = 1;
                result.push(permutation.slice());
            }
            else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    }

    static cartesianProduct(arr) {
        return arr.reduce((a, b) => a.map(x => b.map(y => x.concat(y))).reduce((a, b) => a.concat(b), []), [[]]);
    }

    static getScoutForSupplyMoves(state, possibleScouts, regionsAdjacentWithNumNeeded, numRegionsWithSupply) {

        // This may cap out at about 6 valid adjacent regions per origin due to the factorial growth of permutation,
        // though in practice many are culled before and after permuting.
        const allCombinations = _(possibleScouts).map(possibleScout => {
            if (possibleScout.numAuxiliaCanMoveForSupply === 0) {
                return;
            }

            const validMoveRegions = _(possibleScout.scout.moveRegions).map(region => {
                return _.find(regionsAdjacentWithNumNeeded, adjacent => adjacent.region.id === region.id);
            }).compact().value();

            if (validMoveRegions.length === 0) {
                return;
            }

            const permutations = this.permute(validMoveRegions);

            // Fill every permutation starting from the first region and filling completely as many as possible
            // Cull non-unique combinations
            return _(permutations).map(entry => {
                let numRemaining = possibleScout.numAuxiliaCanMoveForSupply;
                return _(entry).map(moveRegion => {
                    const numToMove = Math.min(moveRegion.numAuxiliaForSupply, numRemaining);
                    if (numToMove === 0) {
                        return;
                    }
                    numRemaining -= numToMove;
                    return {
                        sourceRegionId: possibleScout.scout.region.id,
                        destRegionId: moveRegion.region.id,
                        numNeeded: moveRegion.numAuxiliaForSupply,
                        numMoved: numToMove
                    }
                }).compact().sortBy('destRegionId').value();
            }).uniqBy(entry => _.reduce(entry, (key, data) => { return key + data.destRegionId + data.numMoved; },
                                        '')).value();

        }).compact().value();

        // Ok at this point we have every combination of filling adjacent regions for each possible starting scout region
        // Now we have to find the cartesian product
        const cartesianProduct = this.cartesianProduct(allCombinations);
        const summedCombinations = _(cartesianProduct).map(entry => {
            const margins = _(entry).groupBy('destRegionId').map((moves, regionId) => {
                const sum = _.reduce(moves, (sum, move) => {
                    return sum + move.numMoved;
                }, 0);

                const supplyMargin = sum - moves[0].numNeeded;
                return {
                    regionId,
                    supplyMargin,
                    supplied: supplyMargin >= 0
                }
            }).filter({supplied: true}).sortBy('regionId').value();

            return {
                moves: entry,
                margins: margins,
                numSupplied: margins.length
            }
        }).value();

        // Get the unique combinations of supplied, favoring ones that use the least extra pieces
        const finalCandidates = _(summedCombinations).orderBy(group => _.reduce(group.margins,
                                                                                (sum, margin) => { return margin.supplied ? sum + margin.supplyMargin : sum },
                                                                                0)).uniqBy(
            group => _.reduce(group.margins,
                              (key, margin) => { return key + margin.regionId + (margin.supplied ? '1' : '0'); })).value();

        // Now, finally calculate the most supplied regions as a result
        const solution = _(finalCandidates).shuffle().map(group => {
            const numSuppliedAfter = this.regionsWithSupply(state, [], _(group.margins).filter('supplied').map(
                    'regionId').value()).length - numRegionsWithSupply;
            return {
                group,
                numSuppliedAfter
            }
        }).sortBy('numSuppliedAfter').filter(entry => entry.numSuppliedAfter > 0).reverse().map('group').first();

        if (!solution) {
            return [];
        }

        const targetRegionIds = _.map(solution.margins, 'regionId');
        return _(solution.moves).filter(move => _.indexOf(targetRegionIds, move.destRegionId) >= 0).groupBy(
            'sourceRegionId').values().flatten().value();
    }

    static getScoutToJoinLegionMoves(state, scouts) {
        return _(scouts).filter(scout => scout.numAuxiliaCanMoveForSupply > 0).map(scout => {

            if (scout.scout.region.getLegions().length > 0) {
                return;
            }

            const targetRegionId = _(scout.scout.moveRegions).reduce((accumulator, region) => {
                const numLegions = region.getLegions().length;
                if (numLegions > accumulator.numLegions) {
                    accumulator.target = region.id;
                    accumulator.numLegions = numLegions;
                }
                return accumulator;
            }, {target: null, numLegions: 0}).target;

            if (!targetRegionId) {
                return;
            }

            return {
                sourceRegionId: scout.scout.region.id,
                destRegionId: targetRegionId,
                numMoved: scout.numAuxiliaCanMoveForSupply
            }

        }).compact().value();
    }

    static getScoutsToReveal(state) {
        return _(this.getScoutRegions(state)).map(region => {
            const myHidden = region.getHiddenWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            if(myHidden.length === 0) {
                return;
            }


            const pieces = _(region.pieces()).filter(
                piece => piece.factionId !== FactionIDs.ROMANS && piece.type === 'warband' && !piece.scouted()).sortBy(
                piece => ((state.frost() && piece.factionId === FactionIDs.GERMANIC_TRIBES) ? 'a' : 'b') + (!piece.revealed() ? '1' : '2')).value();

            if(pieces.length === 0) {
                return;
            }

            return {
                regionId: region.id,
                hiddenCount: Math.min(myHidden.length, pieces.length),
                piecesToScout: _(pieces).take(myHidden.length).groupBy('factionId').value()
            }

        }).compact().value();
    }

    static regionsWithSupply(state, invalidRegion, validRegions) {
        const nonPlayerAedui = state.playersByFaction[FactionIDs.AEDUI].isNonPlayer;
        return _(state.regions).filter(
            region => region.getPiecesForFaction(FactionIDs.ROMANS).length > 0).filter(
            region => region.hasValidSupplyLine(FactionIDs.ROMANS, (nonPlayerAedui ? [FactionIDs.AEDUI] : []),
                                                _.compact([invalidRegion]), validRegions)).value();
    }

    static regionsWithoutSupply(state) {
        const nonPlayerAedui = state.playersByFaction[FactionIDs.AEDUI].isNonPlayer;
        return _(state.regions).filter(
            region => region.getPiecesForFaction(FactionIDs.ROMANS).length > 0).reject(
            region => region.hasValidSupplyLine(FactionIDs.ROMANS, (nonPlayerAedui ? [FactionIDs.AEDUI] : []))).value();
    }

    static determineNumAuxiliaCanMove(state, region, suppliedRegions) {
        const maxEnemyMargin = region.getMaxEnemyControllingMargin(FactionIDs.ROMANS);
        const numAuxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length;
        if (maxEnemyMargin === -99 || maxEnemyMargin > 0) {
            return numAuxilia;
        }
        const numForEnemyControl = Math.abs(maxEnemyMargin) + 1;
        if (numForEnemyControl <= numAuxilia) {
            const numSuppliedAfterEnemyControl = this.regionsWithSupply(state, region.id).length;
            if (numSuppliedAfterEnemyControl === suppliedRegions.length) {
                return numAuxilia;
            }
        }

        return Math.min(numForEnemyControl - 1, numAuxilia);
    }

    static getScoutRegions(state) {
        const leaderRegion = this.findLeaderRegion(state);
        return _(state.regions).filter(region => this.withinRangeOfLeader(state, region, leaderRegion)).value();
    }

    static withinRangeOfLeader(state, region, leaderRegion) {
        if(state.hasUnshadedCapability(CapabilityIDs.TITUS_LABIENUS)) {
            return true;
        }

        if (!leaderRegion) {
            return false;
        }

        const leader = leaderRegion.getLeaderForFaction(FactionIDs.ROMANS);

        return region.id === leaderRegion.id || (!leader.isSuccessor() &&
                                                 _.find(leaderRegion.adjacent, adjacent => region.id === adjacent.id));
    }

    static findLeaderRegion(state) {
        return _.find(state.regions, function (region) {
            return _.find(region.piecesByFaction()[FactionIDs.ROMANS], {type: 'leader'});
        });
    }
}

export default RomanScout