import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import RegionGroups from '../../config/regionGroups';
import March from '../../commands/march';
import MovePieces from '../../actions/movePieces';
import HidePieces from '../../actions/hidePieces';
import EnemyFactionPriority from './enemyFactionPriority';

class BelgaeGermanicMarch {

    static march(state, modifiers, enlistResults) {

        let effective = false;
        const validRegions = _(enlistResults).filter(
            result => (result.region.group === RegionGroups.BELGICA || result.region.group === RegionGroups.GERMANIA)).map(
            result => result.region.id).value();

        const effectiveMarch = this.findEffectiveMarch(state, modifiers, validRegions);

        if (effectiveMarch) {
            console.log('*** Belgae Enlisted Germanic March ***');
            HidePieces.execute(
                state, {
                    factionId: FactionIDs.GERMANIC_TRIBES,
                    regionId: effectiveMarch.region.id
                });

            const marchingWarbands = this.getMarchingWarbands(effectiveMarch.region);
            const destination = effectiveMarch.destination;
            if (destination) {
                MovePieces.execute(
                    state, {
                        sourceRegionId: effectiveMarch.region.id,
                        destRegionId: destination.id,
                        pieces: marchingWarbands
                    });
            }
            effective = true;
        }
        return effective;
    }

    static findEffectiveMarch(state, modifiers, validRegions) {
        const marchResults = March.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        return _(marchResults).reject(
            (marchResult) => {
                if (this.getMarchingWarbands(marchResult.region).length < 4) {
                    return true;
                }
                if (_.indexOf(validRegions, marchResult.region.id) < 0) {
                    return true;
                }
            }).map(
            (marchResult) => {
                const destinationData = this.findEffectiveDestination(state, marchResult.destinations);
                if (!destinationData && !_.find(marchResult.region.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES), piece => piece.revealed())) {
                    return;
                }
                return {
                    region: marchResult.region,
                    destination: destinationData ? destinationData.destination : null,
                    priority: destinationData ? destinationData.priority : 5
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();
    }

    static hideAllWarbands(state, faction) {
        _.each(
            state.regions, function (region) {
                const mobilePieces = region.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES);
                if (mobilePieces.length) {
                    HidePieces.execute(
                        state, {
                            factionId: faction.id,
                            regionId: region.id
                        });
                }
            })
    }

    static getMarchingWarbands(region) {
        const mobilePieces = _(region.piecesByFaction()[FactionIDs.GERMANIC_TRIBES]).filter({isMobile: true}).sortBy(
            function (piece) {
                if (piece.scouted()) {
                    return 'a';
                }
                else if (piece.revealed()) {
                    return 'b';
                }
                else {
                    return 'c';
                }
            }).value();
        const numMarching = mobilePieces.length;
        return _.take(mobilePieces, numMarching);
    }

    static getEnemyFactionOrder(state) {
        const factionOrder = _(EnemyFactionPriority).map(
            (priority, factionId) => {
                return {priority, factionId, player: state.playersByFaction[factionId]}
            }).reject({factionId: FactionIDs.GERMANIC_TRIBES}).reject({factionId: FactionIDs.BELGAE}).partition('isNonPlayer').flatten().sortBy('isNonPlayer').value();
        const factionOrderById = {};
        _.each(
            factionOrder, function (faction, index) {
                factionOrderById[faction.id] = index + 1;
            });
        return factionOrderById;
    }

    static findEffectiveDestination(state, destinations) {
        //const enemyFactionOrder = this.getEnemyFactionOrder(state);
        return _(destinations).filter(destination => destination.controllingFactionId()).map(
            (destination) => {
                return {
                    destination,
                    priority: EnemyFactionPriority[destination.controllingFactionId()]
                }
            }
        ).reject(destinationData => !destinationData.priority).sortBy('priority').first();
    }
}

export default BelgaeGermanicMarch;