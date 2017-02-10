/**
 * @Stake Website
 * 
 * Homepage Model
 * @module Homepage
 * @class Homepage
 * @author Matt Benson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

 require('./users.js');

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Homepage model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
 var Homepage = new keystone.List('Homepage', 
	{
		label: 'Home Page',
		singular: 'Home Page',
		track: true,
		nodelete: true
	});

 Homepage.add(
 {
 	name: { 
 		type: String, 
 		default: "Home Page", 
 		hidden: true, 
 		required: true, 
 		initial: true 
 	},

	title: { 
		type: Types.Markdown, 
		label: "Homepage Title",  
		initial: true, 
		required: true 
	},

	header: { 
		type: Types.Markdown, 
		label: "Homepage Header",  
		initial: true, 
		required: true 
	},

	tagline: {
		type: Types.Markdown, 
		label: "Tagline", 
		initial: true, 
		required: true
	},

	createdAt: { 
		type: Date, 
		default: Date.now, 
		noedit: true, 
		hidden: true 
	}
 },

'Call To Action', {
	ctaParagraphOne: {
		type: Types.Markdown,
		label: "Call to Action Paragraph One"},
		initial: false,
		required: false
	},
	
	ctaParagraphTwo: {
		type: Types.Markdown,
		label: "Call to Action Paragraph Two"},
		initial: false,
		required: false
	},

	exampleOneText: {
		type: Types.Markdown,
		label: "Example One Text"
	},

	exampleTwoText: {
		type: Types.Markdown,
		label: "Example Two Text"
	},

	exampleThreeText: {
		type: Types.Markdown,
		label: "Example Three Text"
	},
	
	pointOneText: {
		type: Types.Markdown,
		label: "Point One Text"
	},
	
	pointTwoText: {
		type: Types.Markdown,
		label: "Point Two Text"		
	},
	
	pointThreeText: {
		type: Types.Markdown,
		label: "Point Three Text"
	},
	
	showcaseImage: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Call to Action Image'
        autoCleanup: true
	}
 },

 'Game Features', {
	featureOneIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature One Icon'
        autoCleanup: true
	},

	featureOneParagraph: {
		type: Types.Markdown,
		label: "Feature One Paragraph"
	},

	featureTwoIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature Two Icon'
        autoCleanup: true
	},

	featureTwoParagraph: {
		type: Types.Markdown,
		label: "Feature Two Paragraph"
	},

	featureThreeIcon: {
		type: Types.CloudinaryImage,
		folder: 'at-stake-site/images/layout/home/landing',
		label: 'Feature Three Icon'
        autoCleanup: true
	},

	featureThreeParagraph: {
		type: Types.Markdown,
		label: "Feature Three Paragraph"
	}
},

// // Flowchart Version
// 'Game Overview Flowchart', {
// 	overviewHeader: {
// 		type: Types.Markdown,
// 		label: "Header for Game Overview"
// 	},
// 	overviewRoundOneHeader: {
// 		type: Types.Markdown,
// 		label: "Round One Header"
// 	},
// 	overviewRoundOneParagraph: {
// 		type: Types.Markdown,
// 		label: "Round One Paragraph"
// 	},
// 	overviewRoundTwoHeader: {
// 		type: Types.Markdown,
// 		label: "Round Two Header"
// 	},
// 	overviewRoundTwoParagraph: {
// 		type: Types.Markdown,
// 		label: "Round Two Paragraph"
// 	},
// 	overviewRoundThreeHeader: {
// 		type: Types.Markdown,
// 		label: "Round Three Header"
// 	},
// 	overviewRoundThreeParagraph: {
// 		type: Types.Markdown,
// 		label: "Round Three Paragraph"
// 	}	
// }

// Paragraph Version
'Flow of Game Paragraph', {
	flowOfGameHeader: {
		type: Types.Markdown,
		label: "Header for Game Overview"
	},

	flowOfGamePicture: {
		type: Types.CloudinaryImage,
        label: 'Gameplay Image',
        folder: 'at-stake-site/images/layout/home/landing',
        autoCleanup: true
	},

	flowOfGameParagraph: {
		type: Types.Markdown,
		label: "Paragraph for Game Overview"
	}
}

'Learn More', {
	learnMoreHeader: {
		type: Types.Markdown,
		label: "Learn More Header"
	},

	learnMorePicture: {
		type: Types.CloudinaryImage,
        label: 'Learn More Image',
        folder: 'at-stake-site/images/layout/home/landing',
        autoCleanup: true
	},

	learnMoreParagraph: {
		type: Types.Markdown,
		label: "Learn More Paragraph"
	}
}

'Design and Development Team', {
	principalInvestigator : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Principal Investigator"
	},
	productManager : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Product Manager"
	},
	projectManager : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Project Manager"
	},
	leadDeveloper : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Lead Developer"
	},
	artDirector : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Art Director"
	},
	gameDesigner : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Game Designer"
	},
	otherGameDesigner : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Game Designer"
	},
	juniorDeveloper : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Junior Developer"
	},
	productionAssistant : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Project Manager"
	},
	otherProductionAssistant : { 
		type: keystone.Field.Types.Relationship, 
		ref: 'TeamMembers',
		label: "Project Manager"
	}
}

 );

Homepage.defaultSort = '-createdAt';
Homepage.defaultColumns = 'name, updatedAt';
Homepage.register();
exports = module.exports = Homepage;