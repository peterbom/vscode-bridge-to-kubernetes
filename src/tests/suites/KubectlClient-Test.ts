// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// ----------------------------------------------------------------------------
'use strict';

import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import { CommandRunner } from '../../clients/CommandRunner';
import { KubectlClient } from '../../clients/KubectlClient';
import { IKubernetesIngress } from '../../models/IKubernetesIngress';
import { IKubernetesService } from '../../models/IKubernetesService';
import { accountContextManagerStub, loggerStub } from '../CommonTestObjects';
import { K8sClient } from '../../clients/K8sClient';
import * as k8s from '@kubernetes/client-node';

describe(`KubectlClient Test`, () => {
    beforeEach(() => {
        sinon.restore();
    });
    it(`getIngressesAsync when the kubectl command returns a set of various ingresses`, async () => {
        const returnString = `{
            "apiVersion": "v1",
            "items": [
                {
                    "apiVersion": "extensions/v1beta1",
                    "kind": "Ingress",
                    "metadata": {
                        "annotations": {
                            "kubernetes.io/ingress.class": "traefik",
                            "meta.helm.sh/release-name": "bikesharingsampleapp",
                            "meta.helm.sh/release-namespace": "dev"
                        },
                        "creationTimestamp": "2020-05-12T01:02:49Z",
                        "generation": 1,
                        "labels": {
                            "app": "bikesharingweb",
                            "app.kubernetes.io/managed-by": "Helm",
                            "chart": "bikesharingweb-0.1.0",
                            "heritage": "Helm",
                            "release": "bikesharingsampleapp"
                        },
                        "name": "bikesharingweb",
                        "namespace": "dev",
                        "resourceVersion": "1314825",
                        "selfLink": "/apis/extensions/v1beta1/namespaces/dev/ingresses/bikesharingweb",
                        "uid": "8044fe48-4e8c-454b-b8de-553d0988666e"
                    },
                    "spec": {
                        "rules": [
                            {
                                "host": "dev.bikesharingweb.j7l6v4gz8d.eus.mindaro.io",
                                "http": {
                                    "paths": [
                                        {
                                            "backend": {
                                                "serviceName": "bikesharingweb",
                                                "servicePort": "http"
                                            },
                                            "path": "/"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "status": {
                        "loadBalancer": {
                            "ingress": [
                                {
                                    "ip": "13.72.80.227"
                                }
                            ]
                        }
                    }
                },
                {
                    "apiVersion": "extensions/v1beta1",
                    "kind": "Ingress",
                    "metadata": {
                        "annotations": {
                            "kubernetes.io/ingress.class": "traefik",
                            "meta.helm.sh/release-name": "bikesharingsampleapp",
                            "meta.helm.sh/release-namespace": "dev"
                        },
                        "creationTimestamp": "2020-05-12T01:02:49Z",
                        "generation": 1,
                        "labels": {
                            "app": "gateway",
                            "app.kubernetes.io/managed-by": "Helm",
                            "chart": "gateway-0.1.0",
                            "heritage": "Helm",
                            "release": "bikesharingsampleapp"
                        },
                        "name": "gateway",
                        "namespace": "dev",
                        "resourceVersion": "1314824",
                        "selfLink": "/apis/extensions/v1beta1/namespaces/dev/ingresses/gateway",
                        "uid": "0b61f6fa-f6ad-4a01-b1b2-89255bed41ca"
                    },
                    "spec": {
                        "rules": [
                            {
                                "host": "dev.gateway.j7l6v4gz8d.eus.mindaro.io",
                                "http": {
                                    "paths": [
                                        {
                                            "backend": {
                                                "serviceName": "gateway",
                                                "servicePort": "http"
                                            },
                                            "path": "/"
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    "status": {
                        "loadBalancer": {
                            "ingress": [
                                {
                                    "ip": "13.72.80.227"
                                }
                            ]
                        }
                    }
                }
            ]
        }`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        let ingresses: IKubernetesIngress[];
        ingresses = await kubectlClient.getIngressesAsync(`dev`, `c:/users/alias/.kube/config`, true);

        expect(ingresses.length).to.equal(2);
        expect(ingresses[0].name).to.equal(`bikesharingweb`);
        expect(ingresses[0].namespace).to.equal(`dev`);
        expect(ingresses[0].host).to.equal(`dev.bikesharingweb.j7l6v4gz8d.eus.mindaro.io`);
        expect(ingresses[0].protocol).to.equal(`http`);
        expect(ingresses[1].name).to.equal(`gateway`);
        expect(ingresses[1].namespace).to.equal(`dev`);
        expect(ingresses[1].host).to.equal(`dev.gateway.j7l6v4gz8d.eus.mindaro.io`);
        expect(ingresses[1].protocol).to.equal(`http`);
    });

    it(`getIngressesAsync when the kubectl command returns no ingresses`, async () => {
        const returnString = `{ "items": [] }`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const ingresses: IKubernetesIngress[] = await kubectlClient.getIngressesAsync(`dev`, `c:/users/alias/.kube/config`, true);

        expect(ingresses.length).to.equal(0);
    });

    it(`getServicesAsync when the kubectl command returns a set of various services`, async () => {
        const returnString = `{
                        "items": [
                            {
                                "metadata": {
                                    "name": "bikes",
                                    "namespace": "dev"
                                },
                                "spec": {
                                    "selector": {
                                        "app": "bikes",
                                        "release": "bikesharing"
                                    }
                                }
                            },
                            {
                                "metadata": {
                                    "name": "routingmanager-service",
                                    "namespace": "dev"
                                },
                                "spec": {
                                    "selector": {
                                        "app": "routingmanager-service",
                                        "release": "routingmanager"
                                    }
                                }
                            },
                            {
                                "metadata": {
                                    "name": "bikesharingweb",
                                    "namespace": "dev"
                                },
                                "spec": {
                                    "selector": {
                                        "app": "bikesharingweb",
                                        "release": "bikesharing"
                                    }
                                }
                            },
                            {
                                "metadata": {
                                    "labels": {
                                        "routing.visualstudio.io/generated": "true"
                                    },
                                    "name": "bikesharingwebclone",
                                    "namespace": "dev"
                                },
                                "spec": {
                                    "selector": {
                                        "app": "bikesharingwebclone",
                                        "release": "bikesharing"
                                    }
                                }
                            }
                        ]
                    }`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const services: IKubernetesService[] = await kubectlClient.getServicesAsync();

        expect(services.length).to.equal(2);
        expect(services[0].name).to.equal(`bikes`);
        expect(services[0].namespace).to.equal(`dev`);
        expect(services[0].selector[`app`]).to.equal(`bikes`);
        expect(services[0].selector[`release`]).to.equal(`bikesharing`);
        expect(services[1].name).to.equal(`bikesharingweb`);
        expect(services[1].namespace).to.equal(`dev`);
        expect(services[1].selector[`app`]).to.equal(`bikesharingweb`);
        expect(services[1].selector[`release`]).to.equal(`bikesharing`);
    });

    it(`getServicesAsync when the kubectl command returns no services`, async () => {
        const returnString = `{ "items": [] }`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub,k8sClientMock);
        const services: IKubernetesService[] = await kubectlClient.getServicesAsync();

        expect(services.length).to.equal(0);
    });

    it(`getNamespacesAsync when the kubectl command returns a set of various namespaces`, async () => {
        const returnString = `default kube-node-lease voting-app`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub,k8sClientMock);
        const namespaces: string[] = await kubectlClient.getNamespacesAsync(`c:/users/alias/.kube/config`);

        expect(namespaces.length).to.equal(3);
        expect(namespaces[0]).to.equal(`default`);
        expect(namespaces[1]).to.equal(`kube-node-lease`);
        expect(namespaces[2]).to.equal(`voting-app`);
    });
    it(`getServicesAsync when the kubectl command returns services in system namespaces`, async () => {
        const returnString = `{
            "items": [
                {
                    "metadata": {
                        "name": "azds-webhook-service",
                        "namespace": "azds"
                    },
                    "spec": {
                        "selector": {
                            "component": "azds-injector-webhook",
                            "service": "azds-webhook-service"
                        }
                    }
                },
                {
                    "metadata": {
                        "name": "kube-public-service",
                        "namespace": "kube-public"
                    }
                },
                {
                    "metadata": {
                        "name": "bikes",
                        "namespace": "dev"
                    },
                    "spec": {
                        "selector": {
                            "app": "bikes",
                            "release": "bikesharing"
                        }
                    }
                },
                {
                    "metadata": {
                        "name": "kube-dns",
                        "namespace": "kube-system"
                    },
                    "spec": {
                        "selector": {
                            "k8s-app": "kube-dns"
                        }
                    }
                }
            ]
        }`;
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves(returnString);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)       
        }
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub,k8sClientMock);
        const services: IKubernetesService[] = await kubectlClient.getServicesAsync();

        // Validate that the services in system namespaces have been filtered out properly.
        expect(services.length).to.equal(1);
        expect(services[0].name).to.equal(`bikes`);
        expect(services[0].namespace).to.equal(`dev`);
        expect(services[0].selector[`app`]).to.equal(`bikes`);
        expect(services[0].selector[`release`]).to.equal(`bikesharing`);
    });

    it('getPodName for selected service name', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedEndpoints.resolves({
            response: {},
            body: {
                items: [{
                    metadata: {
                        name: 'stats-api',
                        namespace: 'namespace'
                    },
                    subsets: [{
                        addresses: [{
                            ip: 'sampleip',
                            targetRef: {
                                name: 'stats-api-ff7d66c5b-4nc9x'
                            }
                        }]
                    }]
                }]
            }
        }) 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const podName: string[] = await kubectlClient.getPodName(`stats-api`, `namespace`);
        expect(podName[0]).to.equal('stats-api-ff7d66c5b-4nc9x');
    });

    it('getPodName for selected service name when no pod is found', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedEndpoints.resolves({
            response: {},
            body: {
                items: [{}]
            }
        }) 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const podName: string[] = await kubectlClient.getPodName(`stats-api`, `namespace`);
        expect(podName.length).to.equal(0);
    });

    it('getPodName for selected service name when multiple pods are found', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedEndpoints.resolves({
            response: {},
            body: {
                items: [{
                    metadata: {
                        name: 'stats-api',
                        namespace: 'namespace'
                    },
                    subsets: [{
                        addresses: [{
                            ip: 'sampleip',
                            targetRef: {
                                name: 'stats-api-ff7d66c5b-4nc9x'
                            }
                        }]
                    }]
                },
                {
                    metadata: {
                        name: 'stats-api',
                        namespace: 'namespace'
                    },
                    subsets: [{
                        addresses: [{
                            ip: 'sampleip2',
                            targetRef: {
                                name: 'stats-api-ff7d66c5b-4nc5k'
                            }
                        }]
                    }]
                }]
            }
        }) 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const podName: string[] = await kubectlClient.getPodName(`stats-api`, `namespace`);
        expect(podName[0]).to.equal('stats-api-ff7d66c5b-4nc9x');
        expect(podName[1]).to.equal('stats-api-ff7d66c5b-4nc5k');
    });

    it('getPodName for selected service name when listNamespacedEndpoints throws error', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedEndpoints.throws("error");
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const podName: string[] = await kubectlClient.getPodName(`stats-api`, `namespace`);
        expect(podName).to.be.null;
    });

    it('getContainersList for selected pod name', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedPod.resolves({
            response: {},
            body: {
                items: [{
                    metadata: {
                        name: 'stats-api-ff7d66c5b-4nc9x',
                        namespace: 'namespace'
                    },
                    spec: {
                        containers: [{
                            name: 'stats-api'
                        }]
                    }
                }]
            }
        }); 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const containersList: string[] = await kubectlClient.getContainersList(['stats-api-ff7d66c5b-4nc9x'], 'namespace');
        expect(containersList.length).not.to.equal(0);
        expect(containersList[0]).to.equal('stats-api');
    });

    it('getContainersList when no pod name matches', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedPod.resolves({
            response: {},
            body: {
                items: [{
                    metadata: {
                        name: 'stats-api-ff7d66c5b-4nc9x',
                        namespace: 'namespace'
                    },
                    spec: {
                        containers: [{
                            name: 'stats-api'
                        }]
                    }
                }]
            }
        }); 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const containersList: string[] = await kubectlClient.getContainersList(['dev'], 'namespace');
        expect(containersList.length).to.equal(0);
    });

    it('getContainersList for selected pod name when multiple containers are found', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedPod.resolves({
            response: {},
            body: {
                items: [{
                    metadata: {
                        name: 'stats-api-ff7d66c5b-4nc9x',
                        namespace: 'namespace'
                    },
                    spec: {
                        containers: [{
                            name: 'stats-api'
                        },
                        {
                            name: 'linkerd-proxy'
                        }]
                    }
                }]
            }
        }); 
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const containersList: string[] = await kubectlClient.getContainersList(['stats-api-ff7d66c5b-4nc9x'], 'namespace');
        expect(containersList.length).to.equal(2);
    });

    it('getContainersList for selected pod name when listNamedSpacedPod throws error', async () => {
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        const k8sClientMock = {
            k8sApi: sinon.createStubInstance(k8s.CoreV1Api)      
        }
        k8sClientMock.k8sApi.listNamespacedPod.throws("error");
        const kubectlClient = new KubectlClient(`my/path/kubectl.exe`, commandRunnerStub, accountContextManagerStub, loggerStub, k8sClientMock);
        const containersList: string[] = await kubectlClient.getContainersList(['stats-api-ff7d66c5b-4nc9x'], 'namespace');
        expect(containersList).to.be.null
    });
});