import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import RegionIDs from '../../config/regionIds';
import RegionGroups from '../../config/regionGroups';
import EnlistResults from './enlistResults';

class Enlist extends Command {

    static doTest(state, args) {
        const ignoreSARegionCondition = args.ignoreSARegionCondition;
        const validRegionIds = this.getValidRegionIds(state);

        return _(state.regions).map(
            (region) => {
                if (!ignoreSARegionCondition) {
                    if (_.indexOf(validRegionIds, region.id) < 0) {
                        return;
                    }
                }

                const germanicPieces = region.piecesByFaction()[FactionIDs.GERMANIC_TRIBES];
                if (!germanicPieces) {
                    return;
                }

                const enemyFactions = _(FactionIDs).filter(
                    (factionId) => this.isValidEnemyFaction(region, factionId)).value();
                return new EnlistResults(
                    {
                        region,
                        germanicPieces,
                        enemyFactions
                    });

            }).compact().value();
    }

    static doExecute(state, args) {
        const enlist = args.enlist;
        console.log('*** Belgae Enlisting Germans in ' + enlist.region.name);
    }

    static isValidEnemyFaction(region, factionId) {
        if (factionId === FactionIDs.GERMANIC_TRIBES || factionId === FactionIDs.BELGAE) {
            return false;
        }

        return (region.piecesByFaction()[factionId] || []).length > 0;
    }

    static findLeaderRegion(state) {
        return _.find(
            state.regions, function (region) {
                return _.find(region.piecesByFaction()[FactionIDs.BELGAE], {type: 'leader'});
            });
    }

    static findValidGermanicRegions(state) {
        return _(state.regions).filter(
            function (region) {
                if (region.group === RegionGroups.GERMANIA) {
                    return true;
                }

                const germaniaAdjacent = [RegionIDs.MENAPII, RegionIDs.NERVII, RegionIDs.TREVERI, RegionIDs.SEQUANI];
                if (_.indexOf(germaniaAdjacent, region.id) >= 0) {
                    return true;
                }

                return (region.piecesByFaction()[FactionIDs.GERMANIC_TRIBES] || []).length > 0;
            }).map('id').value();
    }

    static getValidRegionIds(state) {
        const leaderRegion = this.findLeaderRegion(state);
        if (!leaderRegion) {
            return [];
        }
        const leader = leaderRegion.getLeaderForFaction(FactionIDs.BELGAE);
        const isAmbiorix = leader && !leader.isSuccessor();

        const validGermanicRegionIds = this.findValidGermanicRegions(state);
        const validLeaderRegionIds = isAmbiorix ? _(leaderRegion.adjacent).concat([leaderRegion]).map(
            'id').value() : [leaderRegion];

        return _.concat(validGermanicRegionIds, validLeaderRegionIds);
    }

}

export default Enlist;