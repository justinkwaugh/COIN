import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import Region from '../../common/region';
import Logging from '../util/logging';
import FactionIDs from '../config/factionIds';

class FallingSkyRegion extends Region {
    constructor(definition, tribesById) {

        super(definition);

        // Immutable
        this.group = definition.group;
        this.tribes = _.map(
            definition.tribes, function (tribeId) {
                return tribesById[tribeId];
            });
        this.controlValue = definition.controlValue;
        this.adjacent = definition.adjacent;
        this.supplyLines = [];

        // Mutable
        this.inPlay = ko.observable(_.isUndefined(definition.inPlay) ? true : definition.inPlay);
        this.pieces = ko.observableArray();
        this.devastated = ko.observable();

        // Computed
        this.piecesByFaction = ko.pureComputed(
            () => {
                return _.groupBy(this.pieces(), 'factionId');
            });

        this.controllingFactionId = ko.pureComputed(
            () => {
                let controllingFactionId = null;
                const countByFaction = _.countBy(this.pieces(), 'factionId');
                _.each(
                    countByFaction, (count, factionId) => {
                        if (count > (this.pieces().length - count)) {
                            controllingFactionId = factionId;
                        }
                    });
                return controllingFactionId;
            });

        this.controllingMarginByFaction = ko.pureComputed(
            () => {
                const countByFaction = _.countBy(this.pieces(), 'factionId');
                let marginByFaction = {};
                _.each(
                    FactionIDs, (factionId) => {
                        const count = countByFaction[factionId] || 0;
                        marginByFaction[factionId] = count - (this.pieces().length - count);
                    });
                return marginByFaction;
            });

        this.hasFort = ko.pureComputed(
            () => {
                return _.find(this.pieces(), {type: 'fort'});
            });
    }

    isControlledByFaction(factionId) {
        return this.controllingFactionId() === factionId;
    }

    addPiece(piece) {
        this.addPieces([piece]);
    }

    addPieces(pieces) {
        this.pieces.push.apply(this.pieces, pieces);
    }

    removeAlliedTribe(factionId, tribeId) {
        const allyToRemove = _.find(this.piecesByFaction()[factionId], {tribeId: tribeId});
        if (allyToRemove) {
            this.pieces.remove(allyToRemove);
        }
        return allyToRemove;
    }

    removePieces(pieces) {
        this.pieces.removeAll(pieces);
    }

    hasValidSupplyLine(requestingFactionId, agreeingFactionIds) {
        if (!this.isValidForSupplyLine(requestingFactionId, agreeingFactionIds)) {
            return false;
        }

        return _.find(
            this.supplyLines, function (supplyLine) {
                return _.every(
                    supplyLine, function (region) {
                        return region.isValidForSupplyLine();
                    });
            });
    }

    isValidForSupplyLine(requestingFactionId, agreeingFactionIds) {
        const controllingFactionId = this.controllingFactionId();
        return !controllingFactionId ||
               controllingFactionId === requestingFactionId ||
               _.indexOf(agreeingFactionIds, controllingFactionId) >= 0;
    }

    getAgreementsNeededForSupplyLine(requestingFactionId) {
        if (this.hasValidSupplyLine(requestingFactionId, [])) {
            return [];
        }

        const agreementsNeeded = {};

        let agreementForTargetRegion = null;
        if (!this.isValidForSupplyLine(requestingFactionId, [])) {
            agreementForTargetRegion = this.controllingFactionId();
        }
        _.each(
            this.supplyLines, function (supplyLine) {
                const agreementsForSupplyLine = agreementForTargetRegion ? [agreementForTargetRegion] : [];
                _.each(
                    supplyLine, function (region) {
                        if (!region.isValidForSupplyLine(requestingFactionId, agreementsForSupplyLine)) {
                            agreementsForSupplyLine.push(region.controllingFactionId());
                        }
                    });
                const key = _.join(agreementsForSupplyLine.sort(), '|');
                if (!agreementsNeeded[key]) {
                    agreementsNeeded[key] = agreementsForSupplyLine;
                }
            });

        return _(agreementsNeeded).values().sortBy('length').value();
    }

    subduedTribesForFaction(factionId) {
        return _(this.tribes).filter(function(tribe) {
            return tribe.isSubdued() && (!tribe.factionRestriction || tribe.factionRestriction !== factionId);
        }).value();
    }

    getAlliedCityForFaction(factionId) {
        return _(this.tribes).find(function(tribe) {
            return tribe.isAllied() && tribe.isCity && tribe.alliedFactionId() === factionId;
        });
    }

    numAlliesAndCitadelsForFaction(factionId) {
        return _(this.piecesByFaction()[factionId]).filter(function(piece) {
            return piece.type === 'alliedtribe' || piece.type === 'citadel';
        }).value().length;
    }

    getPiecesForFaction(factionId) {
        return this.piecesByFaction()[factionId] || [];
    }

    getHiddenPiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia') && !piece.revealed());
    }

    getMobilePiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], {isMobile:true});
    }

    getWarbandsOrAuxiliaForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia'));
    }

    getAlliesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], { type : 'alliedtribe' });
    }

    getCitadelForFaction(factionId) {
        return _.find(this.piecesByFaction()[factionId], { type : 'citadel' });
    }

    getHiddenWarbandsOrAuxiliaForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia') && !piece.revealed());
    }

    getLeaderForFaction(factionId) {
        return _(this.piecesByFaction()[factionId]).filter({type : 'leader'}).first();
    }

    logState() {
        console.log('*** ' + this.name + ' Region ***');
        console.log('Controlling Faction: ' + (this.controllingFactionId() || 'No Control'));
        console.log('Tribes: ');
        _.each(
            this.tribes, function (tribe) {
                console.log('    ' + tribe.toString());
            });
        _.each(
            this.piecesByFaction(), function (pieces, factionId) {
                console.log(factionId + ' Faction Pieces:');
                Logging.logPieces(pieces);
            });
        console.log('');
    }
}

export default FallingSkyRegion;