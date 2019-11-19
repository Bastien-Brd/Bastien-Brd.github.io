---
title:  "Application-level encryption and Personally Identifiable Information (PII)"
date:   2019-11-12
categories: [development, security]
tags: [development, security]
---


More privacy regulations and laws such as GDPR in Europe (with worldwide implications) require businesses to be very careful and responsible in the way they process, store and communicate user data.

Extra care must be taken when processing what is often called Personally Identifiable Data, also referred to as PII. In most web application, **PII means a user's email address, phone number, full name, etc.** Basically it is any piece of information that, taken individually, can identify a person. 

![Data privacy - Illustration]({{ site.url }}/images/illustrations/undraw_unlock_24mb.png)

As a side note, IP addresses are sometimes considered personally identifiable, although it is a debated topic. The website https://eugdprcompliant.com/personal-data/ mentions: *"A much discussed topic is the IP address. The GDPR states that IP addresses should be considered personal data as it enters the scope of ‘online identifiers’."*

As a web application developer, you should take every reasonable step to protect your user PII data from leakage. There are many steps to this, at various levels of your stack. **One of the ways to protect this data is to use application-level encryption.** 

## Application Level Encryption and its limitations

### Premise

Web applications usually store data in a database on a database server, either managed by a cloud provider (Microsoft Azure SQL Database, AWS RDS, etc.) or on a self-managed VM, or even on the same machine as the application.

At the end of day, the database data is saved on disk somewhere. Most likely, the machine uses disk encryption so the data is encrypted at rest: if someone walks into your cloud provider's datacenter (good luck) and pulls out the drive storing your database, they would only find gibberish. Also your application (hopefully) connects to your database server over SSL/TLS so the data is encrypted in transit.

However **consider if an attacker gains access to the database server (via SSH or any other way) or gets their hand on a database dump: the data is accessible in clear and the user PII is leaked.**

### Solution

Application Level Encryption remedies this by having **the application encrypt the data before sending it and saving it in the database**. When reading the data, the application decrypts it on the fly before serving it or using it.

This means **the data is never stored in clear anywhere**, and the clear version only lives shortly in memory when it is used.

### Drawbacks and Limitations

**Application Level Encryption comes with a lot of overhead**. Encryption and decryption are expensive operations (slow and requires a lot of resource relatively to your application). Implementing it requires additional depencies to manage and maintain carefully and periodically, and developers are usually not very familiar with cryptography at this level. And finally it requires the usage of strong encryption keys which you need to handle very securely: if someone gets their hand on the key, they can access all the encrypted data.

So **application level encryption requires a good and careful key management process**. Using a Key Management System is strongly advised. I found that [Azure Key Vault](https://azure.microsoft.com/en-gb/services/key-vault/) is a great solution, but there are other good ones such as [Hashicorp Vault](https://www.vaultproject.io/). A KMS will allow you to safely store your keys, and manage access to the keys granularly to each application or developer, giving them the minimum required privileges using role-based access control (RBAC). It will also facilitate key rotation: meaning changing the keys periodically (typically every year).

All of this is **additional maintenance, cost, and complexity**, and application level encryption can often be dismissed as overkill.

Another drawback: **your application cannot lookup a database row by an encrypted field**. In the case of PII, this means you cannot lookup a user by email for example, if the email field is stored encrypted (see last section of this article for a practical problem with this and a solution). This is because modern encryption algorithms use some smart random padding before encrypting a message: as a result, encrypting the same message several times does not produce the same encrypted value (but all these encrypted values decrypt to the same message: some serious mathematical black magic happening here). This also makes it impossible to sort by or filter by encrypted fields (you could select a subset of rows and sort/filter the whole set in code in your application, but that requires memory and is much less efficient than database-side). You can pretty much just read/decrypt these fields from rows you've already selected.

Personally, the main drawback is that I don't find application level encryption much more secure than just using encryption in transit and at rest on disk. **Most likely, if an attacker manages to gain access to the database, it would be through a phishing attack on one of your users, a vulnerability in your application**, or gaining access to your application server. In this case, the attacker would also likely use your application to just decrypt the database data before dumping it...

## Why you might still need to use Application Level Encryption

You might have noticed that the "drawbacks" section above is much larger than the "Premise" and "Solutions sections". So in what cases might you still need to use it?

I have found myself being forced to implement application level encryption for some large enterprise clients, whose Security Architecture teams would make that a mandatory requirement. In this case, we just priced that extra overhead in the commercial agreement and implemented it.

In general, application level encryption is useful when you cannot completely trust the database server or provider, or if this is a mandatory requirement from a third party regulator or compliance team.

## One last problem: encrypting application usernames 

Many web applications use email address as the username for its users. Unfortunately the email address is  personally identifiable information, and you might be required to store it only encrypted.

As we saw earlier, it is impossible to lookup a database row by an encrypted field. So how do you go about querying your database for a particular user by email address when they attempt to login for example? 

I'll describe a solution to this problem in my next article.

---
