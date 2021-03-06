/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { EditorModel } from 'vs/workbench/common/editor';
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { IModelService } from 'vs/editor/common/services/modelService';
import { IModeService } from 'vs/editor/common/services/modeService';
import { ModeServiceImpl } from 'vs/editor/common/services/modeServiceImpl';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { ModelServiceImpl } from 'vs/editor/common/services/modelServiceImpl';
import { ITextBufferFactory } from 'vs/editor/common/model';
import URI from 'vs/base/common/uri';
import { createTextBufferFactory } from 'vs/editor/common/model/textModel';

class MyEditorModel extends EditorModel { }
class MyTextEditorModel extends BaseTextEditorModel {
	public createTextEditorModel(value: ITextBufferFactory, resource?: URI, modeId?: string) {
		return super.createTextEditorModel(value, resource, modeId);
	}
}

suite('Workbench - EditorModel', () => {

	let instantiationService: TestInstantiationService;
	let modeService: IModeService;

	setup(() => {
		instantiationService = new TestInstantiationService();
		modeService = instantiationService.stub(IModeService, ModeServiceImpl);
	});

	test('EditorModel', function (done) {
		let counter = 0;

		let m = new MyEditorModel();

		m.onDispose(() => {
			assert(true);
			counter++;
		});

		m.load().then(model => {
			assert(model === m);
			assert.strictEqual(m.isResolved(), true);
			m.dispose();
			assert.equal(counter, 1);
		}).done(() => done());
	});

	test('BaseTextEditorModel', function (done) {
		let modelService = stubModelService(instantiationService);

		let m = new MyTextEditorModel(modelService, modeService);
		m.load().then((model: MyTextEditorModel) => {
			assert(model === m);
			return model.createTextEditorModel(createTextBufferFactory('foo'), null, 'text/plain').then(() => {
				assert.strictEqual(m.isResolved(), true);
			});
		}).done(() => {
			m.dispose();
			done();
		});
	});

	function stubModelService(instantiationService: TestInstantiationService): IModelService {
		instantiationService.stub(IConfigurationService, new TestConfigurationService());
		return instantiationService.createInstance(ModelServiceImpl);
	}
});