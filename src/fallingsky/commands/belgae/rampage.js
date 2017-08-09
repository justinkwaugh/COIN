import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import RampageResults from './rampageResults';
import RevealPieces from '../../actions/revealPieces';
import Losses from 'fallingsky/util/losses';

class Rampage extends Command {

    static doTest(state, args) {
        const ignoreSARegionCondition = args.ignoreSARegionCondition;
        const validRegionIds = this.getValidRegionIds(state);

        return _(state.regions).map(
            (region) => {
                if(!ignoreSARegionCondition) {
                    if(_.indexOf(validRegionIds, region.id) < 0) {
                        return;
                    }
                }

                const hiddenWarbands = region.getHiddenPiecesForFaction(FactionIDs.BELGAE);
                if (hiddenWarbands.length === 0) {
                    return;
                }

                const enemyFactions = _(FactionIDs).filter(
                    (factionId) => this.isValidEnemyFaction(region, factionId)).value();

                if (enemyFactions.length > 0) {
                    return new RampageResults(
                        {
                            region,
                            hiddenWarbands,
                            enemyFactions
                        });
                }
            }).compact().value();
    }

    static doExecute(state, args) {
        const rampage = args.rampage;
        const mobileEnemyPieces = rampage.region.getMobilePiecesForFaction(rampage.chosenFaction);
        const enemyPlayer = state.playersByFaction[rampage.chosenFaction];
        const piecesToRetreatOrRemove = _.take(Losses.orderPiecesForRemoval(state, mobileEnemyPieces, false),
                                               rampage.count);

        console.log('*** Belgae Rampaging in ' + rampage.region.name);

        RevealPieces.execute(state, {factionId: FactionIDs.BELGAE, regionId: rampage.region.id, count: rampage.count});
        enemyPlayer.retreatPieces(state, rampage.region, piecesToRetreatOrRemove, rampage.agreeingFactionId);
    }

    static isValidEnemyFaction(region, factionId) {
        if (factionId === FactionIDs.GERMANIC_TRIBES || factionId === FactionIDs.BELGAE) {
            return false;
        }

        const groupedPieces = _.groupBy(region.piecesByFaction()[factionId], 'type');

        if (!groupedPieces.warband && !groupedPieces.auxilia && !groupedPieces.legion) {
            return false;
        }

        return !groupedPieces.leader && !groupedPieces.citadel && !groupedPieces.fort;
    }

    static findLeaderRegion(state) {
        return _.find(state.regions, function (region) {
            return _.find(region.piecesByFaction()[FactionIDs.BELGAE], {type: 'leader'});
        });
    }

    static getValidRegionIds(state) {
        const leaderRegion = this.findLeaderRegion(state);
        if (!leaderRegion) {
            return [];
        }

        const leader = leaderRegion.getLeaderForFaction(FactionIDs.BELGAE);
        const isAmbiorix = leader && !leader.isSuccessor();
        return isAmbiorix ? _(leaderRegion.adjacent).concat([leaderRegion]).map('id').value() : [leaderRegion];
    }
}

export default Rampage;