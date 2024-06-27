-- CreateTable
CREATE TABLE "OAuthConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectionName" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OAuthConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OAuthConnection_userId_idx" ON "OAuthConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConnection_connectionId_connectionName_key" ON "OAuthConnection"("connectionId", "connectionName");

-- Manual seeding

INSERT INTO _prisma_migrations VALUES('f5df7878-d3c4-4fcb-bdae-26a950c0c923','c59f6b4e9c2742e9f06b74732512cf967bee527096479de2628d79c0a08961bd',1716169137465,'20240503042908_password',NULL,NULL,1716169137424,1);
INSERT INTO _prisma_migrations VALUES('42631c7c-4c18-4551-a6b6-01a69dd77d57','9f3a79c576c19dfe43165890f04df6ebc57df8503f7207196101823bdd4843bd',1716169137491,'20240519225254_roles',NULL,NULL,1716169137468,1);

INSERT INTO Role VALUES('clweasll5000g139a1hc63iz8','admin','',1716169137737,1716169137737);
INSERT INTO Role VALUES('clweaslld000h139ab1binrxb','user','',1716169137745,1716169137745);

INSERT INTO Permission VALUES('clweaslir0000139apk9fjwal','create','user','own','',1716169137649,1716169137649);
INSERT INTO Permission VALUES('clweaslja0001139akd2rszo8','create','user','all','',1716169137670,1716169137670);
INSERT INTO Permission VALUES('clweaslje0002139ab03udose','read','user','own','',1716169137675,1716169137675);
INSERT INTO Permission VALUES('clweasljl0003139a0mlmf1zx','read','user','all','',1716169137681,1716169137681);
INSERT INTO Permission VALUES('clweasljp0004139axvdr2979','update','user','own','',1716169137686,1716169137686);
INSERT INTO Permission VALUES('clweasljt0005139agsk9vq1u','update','user','all','',1716169137690,1716169137690);
INSERT INTO Permission VALUES('clweasljy0006139a9ll4in8f','delete','user','own','',1716169137695,1716169137695);
INSERT INTO Permission VALUES('clweaslk30007139ao18rogn4','delete','user','all','',1716169137699,1716169137699);
INSERT INTO Permission VALUES('clweaslk70008139agoqh0egz','create','comment','own','',1716169137703,1716169137703);
INSERT INTO Permission VALUES('clweaslkb0009139an1vo30nw','create','comment','all','',1716169137707,1716169137707);
INSERT INTO Permission VALUES('clweaslkf000a139axqe9s0sy','read','comment','own','',1716169137712,1716169137712);
INSERT INTO Permission VALUES('clweaslkj000b139a5mkg15ov','read','comment','all','',1716169137715,1716169137715);
INSERT INTO Permission VALUES('clweaslkm000c139asl5t8cmo','update','comment','own','',1716169137718,1716169137718);
INSERT INTO Permission VALUES('clweaslkp000d139a4yzwcl1c','update','comment','all','',1716169137722,1716169137722);
INSERT INTO Permission VALUES('clweaslks000e139au1g5aivs','delete','comment','own','',1716169137725,1716169137725);
INSERT INTO Permission VALUES('clweaslkw000f139aha6xt8a6','delete','comment','all','',1716169137729,1716169137729);

INSERT INTO _PermissionToRole VALUES('clweaslja0001139akd2rszo8','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweasljl0003139a0mlmf1zx','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweasljt0005139agsk9vq1u','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslk30007139ao18rogn4','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslkb0009139an1vo30nw','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslkj000b139a5mkg15ov','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslkp000d139a4yzwcl1c','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslkw000f139aha6xt8a6','clweasll5000g139a1hc63iz8');
INSERT INTO _PermissionToRole VALUES('clweaslir0000139apk9fjwal','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweaslje0002139ab03udose','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweasljp0004139axvdr2979','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweasljy0006139a9ll4in8f','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweaslk70008139agoqh0egz','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweaslkf000a139axqe9s0sy','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweaslkm000c139asl5t8cmo','clweaslld000h139ab1binrxb');
INSERT INTO _PermissionToRole VALUES('clweaslks000e139au1g5aivs','clweaslld000h139ab1binrxb');
