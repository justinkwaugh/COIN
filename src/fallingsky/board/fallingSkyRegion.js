import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import Region from '../../common/region';
import Logging from '../util/logging';
import FactionIDs from '../config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionPieceFactory from '../../common/factionPieceFactory';

class FallingSkyRegion extends Region {
    constructor(definition, tribesById) {

        super(definition);

        // Immutable
        this.group = definition.group;
        this.tribes = ko.observableArray(_.map(
            definition.tribes, function (tribeId) {
                return tribesById[tribeId];
            }));
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

    toJSON() {
        return Object.assign(super.toJSON(), {
            inPlay: this.inPlay(),
            pieces: this.pieces(),
            devastated: this.devastated()
        });
    }
    
    loadGameState(json) {
        const self = this;

        super.loadGameState(json);
        
        self.inPlay(json.inPlay);
        json.pieces.forEach(function(value) {
            const piece = FactionPieceFactory.create(value.type, value);
            piece.loadGameState(value);
            self.pieces.push(piece);
        });
        self.devastated(json.devastated);
    }

    isControlledByFaction(factionId) {
        return this.controllingFactionId() === factionId;
    }

    getMaxEnemyControllingMargin(requestingFactionId) {
        const margin = _(this.controllingMarginByFaction()).reject( (margin, factionId) => factionId === requestingFactionId ).values().max();
        return _.isUndefined(margin) ? -99 : margin;
    }

    addColony(colony) {
        colony.regionId = this.id;
        this.tribes.push(colony);
        this.controlValue += 1;
    }

    removeColony() {
        const colony = this.tribes.pop();
        colony.regionId = null;
        this.controlValue -= 1;
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
        if(!pieces || pieces.length === 0) {
            throw 'Trying to remove nothing from region';
        }
        this.pieces.removeAll(pieces);
    }

    hasValidSupplyLine(requestingFactionId, agreeingFactionIds, invalidRegions=[], validRegions = []) {
        if (_.indexOf(invalidRegions, this.id) >= 0 || (!this.isValidForSupplyLine(requestingFactionId, agreeingFactionIds) && _.indexOf(validRegions, this.id) < 0)) {
            return false;
        }

        if(_.indexOf(_.map(this.adjacent, 'id'), RegionIDs.CISALPINA) >= 0) {
            return true;
        }

        return _.find(this.supplyLines, (supplyLine) => {
                return _.every(
                    supplyLine, (region) => {
                        return _.indexOf(invalidRegions, this.id) < 0 && (region.isValidForSupplyLine(requestingFactionId, agreeingFactionIds) || _.indexOf(validRegions, this.id) >= 0);
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
        return _(this.tribes()).filter(function(tribe) {
            return tribe.isSubdued() && (!tribe.factionRestriction || tribe.factionRestriction === factionId);
        }).value();
    }

    getSubduedTribes() {
        return _(this.tribes()).filter(tribe => tribe.isSubdued()).value();
    }

    getAlliedCityForFaction(factionId) {
        return _(this.tribes()).find(function(tribe) {
            return tribe.isAllied() && tribe.isCity && tribe.alliedFactionId() === factionId;
        });
    }

    getAlliesAndCitadels() {
        return _(this.pieces()).filter(piece => piece.type === 'alliedtribe' || piece.type === 'citadel').value();
    }

    numAlliesAndCitadelsForFaction(factionId) {
        return _(this.piecesByFaction()[factionId]).filter(piece => piece.type === 'alliedtribe' || piece.type === 'citadel').value().length;
    }

    getPiecesForFaction(factionId) {
        return this.piecesByFaction()[factionId] || [];
    }

    getHiddenPiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia') && !piece.revealed());
    }

    getRevealedPiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia') && piece.revealed() && !piece.scouted());
    }

    getScoutedPiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => piece.type === 'warband' && piece.scouted());
    }

    getMobilePiecesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], {isMobile:true});
    }

    getWarbandsOrAuxiliaForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia'));
    }

    getLegions() {
        return _.filter(this.piecesByFaction()[FactionIDs.ROMANS], piece => piece.type === 'legion' );
    }

    getFort() {
        return _.find(this.piecesByFaction()[FactionIDs.ROMANS], piece => piece.type === 'fort' ) || null;
    }

    getAlliesForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], { type : 'alliedtribe' });
    }

    getCitadelForFaction(factionId) {
        return _.find(this.piecesByFaction()[factionId], { type : 'citadel' }) || null;
    }

    getAlliesAndCitadelForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece=> piece.type === 'alliedtribe' || piece.type === 'citadel');
    }

    getHiddenWarbandsOrAuxiliaForFaction(factionId) {
        return _.filter(this.piecesByFaction()[factionId], piece => (piece.type === 'warband' || piece.type === 'auxilia') && !piece.revealed());
    }

    getLeaderForFaction(factionId) {
        return _(this.piecesByFaction()[factionId]).filter({type : 'leader'}).first() || null;
    }

    logState() {
        console.log('*** ' + this.name + ' Region ***');
        if (this.devastated()) console.log('Devastated');
        console.log('Controlling Faction: ' + (this.controllingFactionId() || 'No Control'));
        console.log('Tribes: ');
        _.each(
            this.tribes(), function (tribe) {
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