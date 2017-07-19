import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import EnemyFactionPriority from 'fallingsky/bots/romans/enemyFactionPriority';
import Scout from '../../commands/romans/scout';
import RemoveResources from 'fallingsky/actions/removeResources';
import RemovePieces from 'fallingsky/actions/removePieces';


class RomanScout {
    static scout(state, modifiers) {

        const executableScouts = this.getExecutableScouts(state, modifiers);
        if (executableScouts.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.SCOUT);
        _.each(executableScouts, (scout) => {

        });

        state.turnHistory.getCurrentTurn().commitSpecialAbility();

        return true;
    }

    static getExecutableScouts(state, modifiers) {
        const regionsWithSupply = this.regionsWithSupply(state);
        const possibleScouts = _(Scout.test(state)).shuffle().map((scout) => {
            return {
                scout,
                numAuxiliaCanMoveForSupply: this.determineNumAuxiliaCanMove(state, scout.region, regionsWithSupply)
            };
        }).value();
        const regionsWithoutSupply = this.regionsWithoutSupply(state);
        const regionsAdjacentWithNumNeeded = _(possibleScouts).map(
            (possibleScout) => { return possibleScout.scout.moveRegions; }).flatten().uniqBy('id').map((region) => {

                if (region.controllingFactionId() === FactionIDs.ROMANS) {
                    return;
                }
                const enemyControlMargin = region.getMaxEnemyControllingMargin(FactionIDs.ROMANS);
                if(enemyControlMargin <= 0) {
                    return;
                }

                return {
                    region,
                    numAuxiliaForSupply: enemyControlMargin
                };

        }).compact().filter(regionData=> {
            const numCanMoveHere = _.reduce(possibleScouts, (sum, possibleScout) => {
                if(_.find(possibleScout.scout.moveRegions, scoutMoveRegion=> scoutMoveRegion.id === regionData.region.id)) {
                    return sum + possibleScout.numAuxiliaCanMoveForSupply;
                }
                return sum;
            }, 0);

            return numCanMoveHere >= regionData.numAuxiliaForSupply;
        }).value();



        debugger;
        return [];
    }

    static regionsWithSupply(state, invalidRegion) {
        const nonPlayerAedui = state.playersByFaction[FactionIDs.AEDUI].isNonPlayer;
        return _(state.regions).filter(
            region => region.getPiecesForFaction(FactionIDs.ROMANS).length > 0).filter(
            region => region.hasValidSupplyLine(FactionIDs.ROMANS, (nonPlayerAedui ? [FactionIDs.AEDUI] : []),
                                                _.compact([invalidRegion]))).value();
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

        return Math.min(numForEnemyControl, numAuxilia);
    }

}

export default RomanScout